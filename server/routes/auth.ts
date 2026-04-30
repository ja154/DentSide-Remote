import { Router } from 'express';
import { AppError } from '../errors.ts';
import { AuthProfileCreateSchema, UserProfilePatchSchema } from '../schemas.ts';
import { getOptionalDocument, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { UserProfile } from '../types.ts';

export const authRouter = Router();

authRouter.use(requireAuth);

authRouter.post(
  '/profile',
  asyncHandler(async (req, res) => {
    if (!req.firebaseUser || !req.firebaseToken) {
      throw new AppError('Authentication context is not available.', 401, 'unauthorized');
    }

    const { role, displayName, authMethod } = AuthProfileCreateSchema.parse(req.body);
    const existingProfile = await getOptionalDocument<UserProfile>(`users/${req.firebaseUser.uid}`, req.firebaseToken);
    const timestamp = new Date().toISOString();

    const profile: UserProfile = {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
      displayName: existingProfile?.displayName || displayName || req.firebaseUser.displayName,
      photoURL: req.firebaseUser.photoURL || existingProfile?.photoURL,
      authMethod: existingProfile?.authMethod || authMethod,
      role: existingProfile?.role || role,
      createdAt: existingProfile?.createdAt || timestamp,
      updatedAt: timestamp,
      onboardingComplete: existingProfile?.onboardingComplete ?? false,
      experience: existingProfile?.experience,
      licenses: existingProfile?.licenses,
      availability: existingProfile?.availability,
      interests: existingProfile?.interests,
      verificationStatus: existingProfile?.verificationStatus || 'unverified',
    };

    await setDocument(`users/${req.firebaseUser.uid}`, profile, req.firebaseToken);
    res.status(existingProfile ? 200 : 201).json(profile);
  }),
);

authRouter.get(
  '/profile',
  loadUserProfile,
  asyncHandler(async (req, res) => {
    res.json(req.profile || null);
  }),
);

authRouter.patch(
  '/profile',
  loadUserProfile,
  ensureProfile,
  asyncHandler(async (req, res) => {
    if (!req.firebaseUser || !req.firebaseToken || !req.profile) {
      throw new AppError('Authentication context is not available.', 401, 'unauthorized');
    }

    const patch = UserProfilePatchSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const nextProfile: UserProfile = {
      ...req.profile,
      ...patch,
      updatedAt: timestamp,
    };

    await setDocument(
      `users/${req.firebaseUser.uid}`,
      { ...patch, updatedAt: timestamp },
      req.firebaseToken,
      { merge: true },
    );
    res.json(nextProfile);
  }),
);
