import { Router } from 'express';
import { AppError } from '../errors.ts';
import { VerificationSubmitSchema } from '../schemas.ts';
import { getOptionalDocument, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { env } from '../env.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { VerificationRecord } from '../types.ts';

export const verificationRouter = Router();

verificationRouter.use(requireAuth, loadUserProfile, ensureProfile);

verificationRouter.get(
  '/status',
  requireRole(['dentist', 'admin']),
  asyncHandler(async (req, res) => {
    const verification = await getOptionalDocument<VerificationRecord>(`verifications/${req.profile!.uid}`, req.firebaseToken!);

    res.json({
      verification,
      storageConfigured: env.storageConfigured,
    });
  }),
);

verificationRouter.post(
  '/',
  requireRole('dentist'),
  asyncHandler(async (req, res) => {
    const payload = VerificationSubmitSchema.parse(req.body);
    const timestamp = new Date().toISOString();

    const verification: VerificationRecord = {
      userId: req.profile!.uid,
      legalName: payload.legalName,
      email: payload.email,
      clinic: payload.clinic,
      issuingState: payload.issuingState,
      licenseNumber: payload.licenseNumber,
      documentName: payload.documentName,
      status: 'pending',
      storageMode: env.storageConfigured ? 'bucket' : 'metadata_only',
      submittedAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`verifications/${req.profile!.uid}`, verification, req.firebaseToken!);
    await setDocument(
      `users/${req.profile!.uid}`,
      {
        displayName: payload.legalName,
        onboardingComplete: true,
        verificationStatus: 'pending',
      },
      req.firebaseToken!,
      { merge: true },
    );

    res.status(201).json({
      verification,
      storageConfigured: env.storageConfigured,
      message: env.storageConfigured
        ? 'Verification submitted successfully.'
        : 'Verification submitted as metadata only. Configure Firebase Storage before accepting license uploads.',
    });
  }),
);
