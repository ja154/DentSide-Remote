import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { env } from '../env.ts';
import { WithdrawalRequestSchema } from '../schemas.ts';
import { listDocuments, setDocument } from '../services/data-provider.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { WalletSummary, WithdrawalRecord } from '../types.ts';

export const withdrawRouter = Router();

withdrawRouter.use(requireAuth, loadUserProfile, ensureProfile, requireRole(['dentist', 'admin']));

withdrawRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const records = await listDocuments<WithdrawalRecord>('withdrawals', req.authToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const userRecords = records.filter((record) =>
      req.profile!.role === 'admin' ? true : record.userId === req.profile!.uid,
    );

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
    const records = await listDocuments<WithdrawalRecord>('withdrawals', req.authToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const userRecords = records
      .filter((record) => (req.profile!.role === 'admin' ? true : record.userId === req.profile!.uid))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

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

    const withdrawal: WithdrawalRecord = {
      userId: req.profile!.uid,
      email: req.profile!.email,
      amount: payload.amount,
      currency: payload.currency,
      provider: payload.provider,
      destinationLabel: payload.destinationLabel,
      status: providerConfigured ? 'queued' : 'pending_provider_setup',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`withdrawals/${documentId}`, withdrawal, req.authToken!);

    res.status(202).json({
      id: documentId,
      ...withdrawal,
      message: providerConfigured
        ? 'Withdrawal request queued for provider processing.'
        : `Saved your ${payload.provider} withdrawal request, but the payout provider is not configured yet.`,
    });
  }),
);
