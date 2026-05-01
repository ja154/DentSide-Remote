import { Router } from 'express';
import { AppError } from '../errors.ts';
import { AuthProfileCreateSchema, UserProfilePatchSchema } from '../schemas.ts';
import { getOptionalDocument, setDocument } from '../services/data-provider.ts';
import { ensureProfile, loadUserProfile, requireAuth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { UserProfile } from '../types.ts';

export const authRouter = Router();

authRouter.use(requireAuth);

authRouter.post(
  '/profile',
  asyncHandler(async (req, res) => {
    if (!req.authUser || !req.authToken) {
      throw new AppError('Authentication context is not available.', 401, 'unauthorized');
    }

    const { role, displayName, authMethod } = AuthProfileCreateSchema.parse(req.body);
    const existingProfile = await getOptionalDocument<UserProfile>(`users/${req.authUser.uid}`, req.authToken);
    const timestamp = new Date().toISOString();

    const profile: UserProfile = {
      uid: req.authUser.uid,
      email: req.authUser.email,
      displayName: existingProfile?.displayName || displayName || req.authUser.displayName,
      photoURL: req.authUser.photoURL || existingProfile?.photoURL,
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

    await setDocument(`users/${req.authUser.uid}`, profile, req.authToken);
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
    if (!req.authUser || !req.authToken || !req.profile) {
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
      `users/${req.authUser.uid}`,
      { ...patch, updatedAt: timestamp },
      req.authToken,
      { merge: true },
    );
    res.json(nextProfile);
  }),
);
