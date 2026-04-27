import { Router } from 'express';
import { AdminVerificationDecisionSchema } from '../schemas.ts';
import { getOptionalDocument, listDocuments, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { env } from '../env.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { AppointmentRecord, GigRecord, UserProfile, VerificationRecord, WithdrawalRecord } from '../types.ts';

export const adminRouter = Router();

adminRouter.use(requireAuth, loadUserProfile, ensureProfile, requireRole('admin'));

adminRouter.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [users, gigs, verifications, bookings, withdrawals] = await Promise.all([
      listDocuments<UserProfile>('users', req.firebaseToken!, { pageSize: 200 }),
      listDocuments<GigRecord>('gigs', req.firebaseToken!, { pageSize: 200 }),
      listDocuments<VerificationRecord>('verifications', req.firebaseToken!, { pageSize: 200 }),
      listDocuments<AppointmentRecord>('bookings', req.firebaseToken!, { pageSize: 200 }),
      listDocuments<WithdrawalRecord>('withdrawals', req.firebaseToken!, { pageSize: 200 }),
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
        firebase: env.firebaseConfigured,
        storage: env.storageConfigured,
        stripe: env.stripeConfigured,
        mpesa: env.mpesaConfigured,
      },
    });
  }),
);

adminRouter.get(
  '/verifications',
  asyncHandler(async (req, res) => {
    const verifications = await listDocuments<VerificationRecord>('verifications', req.firebaseToken!, {
      pageSize: 200,
      orderBy: 'updatedAt desc',
    });

    res.json(verifications.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
  }),
);

adminRouter.patch(
  '/verifications/:userId',
  asyncHandler(async (req, res) => {
    const payload = AdminVerificationDecisionSchema.parse(req.body);
    const { userId } = req.params;
    const existing = await getOptionalDocument<VerificationRecord>(`verifications/${userId}`, req.firebaseToken!);

    if (!existing) {
      res.status(404).json({ error: 'Verification request not found.' });
      return;
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
      {
        status: payload.status,
        reviewNote: payload.reviewNote,
        updatedAt: timestamp,
      },
      req.firebaseToken!,
      { merge: true },
    );

    await setDocument(
      `users/${userId}`,
      {
        verificationStatus: payload.status,
      },
      req.firebaseToken!,
      { merge: true },
    );

    res.json({ id: userId, ...verification });
  }),
);

adminRouter.get(
  '/gigs',
  asyncHandler(async (req, res) => {
    const gigs = await listDocuments<GigRecord>('gigs', req.firebaseToken!, {
      pageSize: 200,
      orderBy: 'updatedAt desc',
    });

    res.json(gigs);
  }),
);

adminRouter.get(
  '/appointments',
  asyncHandler(async (req, res) => {
    const appointments = await listDocuments<AppointmentRecord>('bookings', req.firebaseToken!, {
      pageSize: 200,
      orderBy: 'updatedAt desc',
    });

    res.json(appointments);
  }),
);

adminRouter.get(
  '/withdrawals',
  asyncHandler(async (req, res) => {
    const withdrawals = await listDocuments<WithdrawalRecord>('withdrawals', req.firebaseToken!, {
      pageSize: 200,
      orderBy: 'updatedAt desc',
    });

    res.json(withdrawals);
  }),
);
