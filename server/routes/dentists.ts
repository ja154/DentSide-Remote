import { Router } from 'express';
import { listDocuments } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { UserProfile, WithId } from '../types.ts';

export const dentistsRouter = Router();

dentistsRouter.use(requireAuth, loadUserProfile, ensureProfile);

/**
 * GET /api/dentists
 * Returns a paginated list of approved dentist profiles visible to clients.
 * Filters to role === 'dentist' and verificationStatus === 'approved' by default.
 * Supports ?search=term and ?all=true (admin-only) to bypass verification filter.
 */
dentistsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const documents = await listDocuments<UserProfile>('users', req.firebaseToken!, {
      pageSize: 200,
    });

    const isAdmin = req.profile!.role === 'admin';
    const showAll = isAdmin && req.query.all === 'true';
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    const dentists = documents
      .filter((user) => user.role === 'dentist')
      .filter((user) => showAll || user.verificationStatus === 'approved')
      .filter((user) => {
        if (!search) return true;
        return [
          user.displayName || '',
          user.experience || '',
          ...(user.interests || []),
          ...(user.licenses || []),
          user.availability || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .map(
        (user): Omit<WithId<UserProfile>, 'email' | 'createdAt'> & { id: string } => ({
          // Expose only safe public fields — never expose email or internal ids to clients
          id: user.uid,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: user.role,
          experience: user.experience,
          interests: user.interests,
          availability: user.availability,
          verificationStatus: user.verificationStatus,
          // Intentionally excluded: email, licenses (raw numbers), createdAt
          onboardingComplete: user.onboardingComplete,
        }),
      );

    res.json(dentists);
  }),
);

/**
 * GET /api/dentists/:dentistId
 * Returns a single dentist's public profile.
 * Clients can only view approved dentists; admins can view any.
 */
dentistsRouter.get(
  '/:dentistId',
  asyncHandler(async (req, res) => {
    const { dentistId } = req.params;
    const isAdmin = req.profile!.role === 'admin';

    const documents = await listDocuments<UserProfile>('users', req.firebaseToken!, {
      pageSize: 1,
    });

    const dentist = documents.find((u) => u.uid === dentistId && u.role === 'dentist');

    if (!dentist) {
      res.status(404).json({ error: 'Dentist profile not found.', code: 'not_found' });
      return;
    }

    if (!isAdmin && dentist.verificationStatus !== 'approved') {
      res.status(404).json({ error: 'Dentist profile not found.', code: 'not_found' });
      return;
    }

    res.json({
      id: dentist.uid,
      uid: dentist.uid,
      displayName: dentist.displayName,
      photoURL: dentist.photoURL,
      role: dentist.role,
      experience: dentist.experience,
      interests: dentist.interests,
      availability: dentist.availability,
      verificationStatus: dentist.verificationStatus,
      onboardingComplete: dentist.onboardingComplete,
    });
  }),
);
