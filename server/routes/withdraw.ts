import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { env } from '../env.ts';
import { AppError } from '../errors.ts';
import { WithdrawalRequestSchema } from '../schemas.ts';
import { initiateMpesaWithdrawal } from '../services/mpesa.ts';
import { listDocuments, setDocument } from '../services/data-provider.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { WalletSummary, WithdrawalRecord } from '../types.ts';
import { normalizeKenyanPhoneNumber } from '../utils/phone.ts';

export const withdrawRouter = Router();

withdrawRouter.use(requireAuth, loadUserProfile, ensureProfile, requireRole(['dentist', 'admin']));

withdrawRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const userRecords = await listDocuments<WithdrawalRecord>('withdrawals', req.authToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
      filters:
        req.profile!.role === 'admin'
          ? undefined
          : [{ column: 'userId', value: req.profile!.uid }],
    });

    const summary: WalletSummary = {
      availableBalance: 0,
      pendingBalance: userRecords
        .filter((record) => record.status === 'queued' || record.status === 'pending_provider_setup')
        .reduce((total, record) => total + record.amount, 0),
      lifetimeWithdrawn: userRecords
        .filter((record) => record.status === 'paid')
        .reduce((total, record) => total + record.amount, 0),
      defaultCurrency: userRecords[0]?.currency || 'USD',
      payoutsConfigured: {
        stripe: env.stripeConfigured,
        mpesa: env.mpesaConfigured,
      },
    };

    res.json(summary);
  }),
);

withdrawRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    const userRecords = await listDocuments<WithdrawalRecord>('withdrawals', req.authToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
      filters:
        req.profile!.role === 'admin'
          ? undefined
          : [{ column: 'userId', value: req.profile!.uid }],
    });

    res.json(userRecords);
  }),
);

withdrawRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = WithdrawalRequestSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const documentId = randomUUID();
    const providerConfigured = payload.provider === 'stripe' ? env.stripeConfigured : env.mpesaConfigured;
    const normalizedDestinationPhone =
      payload.provider === 'mpesa'
        ? normalizeKenyanPhoneNumber(
            payload.destinationAccount || req.profile!.phoneNumber || '',
          )
        : null;

    if (payload.provider === 'mpesa' && payload.currency !== 'KES') {
      throw new AppError('M-Pesa withdrawals must use KES.', 400, 'bad_request');
    }

    if (payload.provider === 'mpesa' && !normalizedDestinationPhone) {
      throw new AppError(
        'Provide a valid Kenyan mobile number for your M-Pesa payout destination.',
        400,
        'bad_request',
      );
    }

    const withdrawal: WithdrawalRecord = {
      userId: req.profile!.uid,
      email: req.profile!.email,
      phoneNumber: req.profile!.phoneNumber,
      amount: payload.amount,
      currency: payload.currency,
      provider: payload.provider,
      destinationLabel: payload.destinationLabel,
      destinationAccount:
        payload.provider === 'mpesa'
          ? normalizedDestinationPhone || undefined
          : payload.destinationAccount,
      status: providerConfigured ? 'queued' : 'pending_provider_setup',
      providerStatus: providerConfigured ? 'queued' : 'provider_not_configured',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`withdrawals/${documentId}`, withdrawal, req.authToken!);

    let nextWithdrawal: WithdrawalRecord = withdrawal;
    let message = providerConfigured
      ? 'Withdrawal request queued for provider processing.'
      : `Saved your ${payload.provider} withdrawal request, but the payout provider is not configured yet.`;

    if (payload.provider === 'mpesa' && providerConfigured && normalizedDestinationPhone) {
      try {
        const providerResult = await initiateMpesaWithdrawal({
          withdrawalId: documentId,
          amount: payload.amount,
          phoneNumber: normalizedDestinationPhone,
        });
        const providerUpdatedAt = new Date().toISOString();

        nextWithdrawal = {
          ...withdrawal,
          providerRequestId: providerResult.providerRequestId,
          providerStatus: providerResult.providerStatus,
          providerMetadata: providerResult.providerMetadata,
          providerUpdatedAt,
          updatedAt: providerUpdatedAt,
        };

        await setDocument(
          `withdrawals/${documentId}`,
          {
            providerRequestId: providerResult.providerRequestId,
            providerStatus: providerResult.providerStatus,
            providerMetadata: providerResult.providerMetadata,
            providerUpdatedAt: nextWithdrawal.providerUpdatedAt,
            updatedAt: providerUpdatedAt,
          },
          req.authToken!,
          { merge: true },
        );

        message = 'M-Pesa withdrawal submitted and awaiting provider confirmation.';
      } catch (error) {
        const failureMessage =
          error instanceof Error ? error.message : 'M-Pesa payout submission failed.';
        nextWithdrawal = {
          ...withdrawal,
          status: 'failed',
          providerStatus: 'submission_failed',
          statusReason: failureMessage,
          providerUpdatedAt: new Date().toISOString(),
        };

        await setDocument(
          `withdrawals/${documentId}`,
          {
            status: 'failed',
            providerStatus: 'submission_failed',
            statusReason: failureMessage,
            providerUpdatedAt: nextWithdrawal.providerUpdatedAt,
            updatedAt: nextWithdrawal.providerUpdatedAt,
          },
          req.authToken!,
          { merge: true },
        );

        message = `Saved your M-Pesa withdrawal request, but the provider returned an error: ${failureMessage}`;
      }
    }

    res.status(202).json({
      id: documentId,
      ...nextWithdrawal,
      message,
    });
  }),
);
