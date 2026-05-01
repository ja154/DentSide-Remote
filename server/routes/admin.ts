import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.ts';
import { AdminVerificationDecisionSchema, AdminWithdrawalDecisionSchema, AdminUserRolePatchSchema } from '../schemas.ts';
import {
  getOptionalDocument,
  listDocuments,
  setDocument,
} from '../services/data-provider.ts';
import {
  ensureProfile,
  loadUserProfile,
  requireAuth,
  requireRole,
} from '../middleware/auth.ts';
import { createNotification } from './notifications.ts';
import { env } from '../env.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type {
  AppointmentRecord,
  GigRecord,
  UserProfile,
  VerificationRecord,
  WithdrawalRecord,
} from '../types.ts';

export const adminRouter = Router();

adminRouter.use(requireAuth, loadUserProfile, ensureProfile, requireRole('admin'));

// ─── Overview ────────────────────────────────────────────────────────────────

adminRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [users, gigs, verifications, bookings, withdrawals] = await Promise.all([
      listDocuments<UserProfile>('users', req.authToken!, { pageSize: 200 }),
      listDocuments<GigRecord>('gigs', req.authToken!, { pageSize: 200 }),
      listDocuments<VerificationRecord>('verifications', req.authToken!, { pageSize: 200 }),
      listDocuments<AppointmentRecord>('bookings', req.authToken!, { pageSize: 200 }),
      listDocuments<WithdrawalRecord>('withdrawals', req.authToken!, { pageSize: 200 }),
    ]);

    res.json({
      counts: {
        users: users.length,
        gigs: gigs.length,
        verifications: verifications.length,
        bookings: bookings.length,
        withdrawals: withdrawals.length,
      },
      integrations: {
        supabase: env.supabaseConfigured,
        storage: env.storageConfigured,
        stripe: env.stripeConfigured,
        mpesa: env.mpesaConfigured,
      },
      providers: {
        auth: 'supabase',
        data: 'supabase',
        storage: env.storageProvider,
      },
    });
  }),
);

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Returns all users with optional role filter.
 */
adminRouter.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await listDocuments<UserProfile>('users', req.authToken!, {
      pageSize: 200,
    });

    const roleFilter =
      typeof req.query.role === 'string' ? req.query.role.trim() : '';
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    const filtered = users
      .filter((u) => !roleFilter || u.role === roleFilter)
      .filter((u) => {
        if (!search) return true;
        return [u.displayName || '', u.email, u.uid]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json(filtered);
  }),
);

/**
 * PATCH /api/admin/users/:userId/role
 * Change a user's role. Use with caution — demoting an admin is allowed.
 */
adminRouter.patch(
  '/users/:userId/role',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.profile!.uid) {
      throw new AppError('You cannot change your own role.', 403, 'forbidden');
    }

    const payload = AdminUserRolePatchSchema.parse(req.body);
    const existing = await getOptionalDocument<UserProfile>(
      `users/${userId}`,
      req.authToken!,
    );

    if (!existing) {
      throw new AppError('User not found.', 404, 'not_found');
    }

    const timestamp = new Date().toISOString();
    await setDocument(
      `users/${userId}`,
      { role: payload.role, updatedAt: timestamp },
      req.authToken!,
      { merge: true },
    );

    res.json({ id: userId, ...existing, role: payload.role });
  }),
);

// ─── Verifications ───────────────────────────────────────────────────────────

adminRouter.get(
  '/verifications',
  asyncHandler(async (req, res) => {
    const verifications = await listDocuments<VerificationRecord>(
      'verifications',
      req.authToken!,
      { pageSize: 200 },
    );

    res.json(verifications.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }),
);

adminRouter.patch(
  '/verifications/:userId',
  asyncHandler(async (req, res) => {
    const payload = AdminVerificationDecisionSchema.parse(req.body);
    const { userId } = req.params;
    const existing = await getOptionalDocument<VerificationRecord>(
      `verifications/${userId}`,
      req.authToken!,
    );

    if (!existing) {
      throw new AppError('Verification request not found.', 404, 'not_found');
    }

    const timestamp = new Date().toISOString();
    const verification: VerificationRecord = {
      ...existing,
      status: payload.status,
      reviewNote: payload.reviewNote,
      updatedAt: timestamp,
    };

    await setDocument(
      `verifications/${userId}`,
      { status: payload.status, reviewNote: payload.reviewNote, updatedAt: timestamp },
      req.authToken!,
      { merge: true },
    );

    await setDocument(
      `users/${userId}`,
      { verificationStatus: payload.status },
      req.authToken!,
      { merge: true },
    );

    if (payload.status === 'approved' || payload.status === 'rejected') {
      await createNotification(
        {
          userId,
          type:
            payload.status === 'approved'
              ? 'verification_approved'
              : 'verification_rejected',
          title:
            payload.status === 'approved'
              ? 'Verification approved'
              : 'Verification needs attention',
          body:
            payload.status === 'approved'
              ? 'Your verification has been approved. You can now access approved practitioner experiences.'
              : payload.reviewNote || 'Your verification was rejected. Review the note from the admin team and resubmit when ready.',
          relatedId: userId,
        },
        req.authToken!,
      ).catch(() => null);
    }

    res.json({ id: userId, ...verification });
  }),
);

// ─── Gigs ────────────────────────────────────────────────────────────────────

adminRouter.get(
  '/gigs',
  asyncHandler(async (req, res) => {
    const gigs = await listDocuments<GigRecord>('gigs', req.authToken!, {
      pageSize: 200,
    });

    res.json(gigs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }),
);

// ─── Appointments ─────────────────────────────────────────────────────────────

adminRouter.get(
  '/appointments',
  asyncHandler(async (req, res) => {
    const appointments = await listDocuments<AppointmentRecord>('bookings', req.authToken!, {
      pageSize: 200,
    });

    res.json(appointments.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }),
);

// ─── Withdrawals ─────────────────────────────────────────────────────────────

adminRouter.get(
  '/withdrawals',
  asyncHandler(async (req, res) => {
    const withdrawals = await listDocuments<WithdrawalRecord>(
      'withdrawals',
      req.authToken!,
      { pageSize: 200 },
    );

    res.json(withdrawals.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  }),
);

/**
 * PATCH /api/admin/withdrawals/:withdrawalId
 * Advance a withdrawal to 'paid' or 'failed'. Admins only.
 */
adminRouter.patch(
  '/withdrawals/:withdrawalId',
  asyncHandler(async (req, res) => {
    const { withdrawalId } = req.params;
    const payload = AdminWithdrawalDecisionSchema.parse(req.body);

    const existing = await getOptionalDocument<WithdrawalRecord>(
      `withdrawals/${withdrawalId}`,
      req.authToken!,
    );

    if (!existing) {
      throw new AppError('Withdrawal record not found.', 404, 'not_found');
    }

    if (existing.status === 'paid' || existing.status === 'failed') {
      throw new AppError(
        `Withdrawal is already in terminal state "${existing.status}".`,
        409,
        'conflict',
      );
    }

    const timestamp = new Date().toISOString();
    await setDocument(
      `withdrawals/${withdrawalId}`,
      { status: payload.status, updatedAt: timestamp },
      req.authToken!,
      { merge: true },
    );

    if (payload.status === 'paid' || payload.status === 'failed') {
      await createNotification(
        {
          userId: existing.userId,
          type: payload.status === 'paid' ? 'withdrawal_paid' : 'withdrawal_failed',
          title:
            payload.status === 'paid'
              ? 'Withdrawal paid'
              : 'Withdrawal failed',
          body:
            payload.status === 'paid'
              ? `Your ${existing.provider} withdrawal for ${existing.currency} ${existing.amount} was marked as paid.`
              : `Your ${existing.provider} withdrawal for ${existing.currency} ${existing.amount} needs attention from operations.`,
          relatedId: withdrawalId,
        },
        req.authToken!,
      ).catch(() => null);
    }

    res.json({ id: withdrawalId, ...existing, status: payload.status, updatedAt: timestamp });
  }),
);
