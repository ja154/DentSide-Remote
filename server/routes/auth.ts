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

    const { role } = AuthProfileCreateSchema.parse(req.body);
    const existingProfile = await getOptionalDocument<UserProfile>(`users/${req.firebaseUser.uid}`, req.firebaseToken);

    const profile: UserProfile = {
      uid: req.firebaseUser.uid,
      email: req.firebaseUser.email,
      displayName: req.firebaseUser.displayName,
      photoURL: req.firebaseUser.photoURL,
      role: existingProfile?.role || role,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
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
    if (!req.profile) {
      throw new AppError('No profile exists for this user yet.', 404, 'not_found');
    }

    res.json(req.profile);
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
    const nextProfile: UserProfile = {
      ...req.profile,
      ...patch,
    };

    await setDocument(`users/${req.firebaseUser.uid}`, patch, req.firebaseToken, { merge: true });
    res.json(nextProfile);
  }),
);
