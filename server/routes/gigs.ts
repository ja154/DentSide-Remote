import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.ts';
import { GigCreateSchema, GigPatchSchema } from '../schemas.ts';
import {
  getOptionalDocument,
  listDocuments,
  setDocument,
} from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { GigRecord, WithId } from '../types.ts';

export const gigsRouter = Router();

gigsRouter.use(requireAuth, loadUserProfile, ensureProfile);

/**
 * GET /api/gigs
 * Returns open gigs visible to the authenticated user.
 * Admins and creators can also see their own draft/closed gigs.
 */
gigsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const documents = await listDocuments<GigRecord>('gigs', req.firebaseToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const uid = req.profile!.uid;
    const isAdmin = req.profile!.role === 'admin';
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
    const typeFilter =
      typeof req.query.type === 'string' ? req.query.type.trim().toLowerCase() : '';

    const gigs = documents
      .filter((gig) => {
        // Admins see everything; creators see their own; everyone else sees only 'open'
        if (isAdmin) return true;
        if (gig.createdBy === uid) return true;
        return gig.status === 'open';
      })
      .filter((gig) => {
        if (!search) return true;
        return [gig.title, gig.company, gig.type, gig.description || '', ...gig.tags]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .filter((gig) => {
        if (!typeFilter) return true;
        return gig.type.toLowerCase().includes(typeFilter);
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    res.json(gigs satisfies Array<WithId<GigRecord>>);
  }),
);

/**
 * GET /api/gigs/:gigId
 * Returns a single gig. Non-creators can only fetch open gigs.
 */
gigsRouter.get(
  '/:gigId',
  asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const uid = req.profile!.uid;
    const isAdmin = req.profile!.role === 'admin';

    const gig = await getOptionalDocument<GigRecord>(`gigs/${gigId}`, req.firebaseToken!);

    if (!gig) {
      throw new AppError('Gig not found.', 404, 'not_found');
    }

    const canView = isAdmin || gig.createdBy === uid || gig.status === 'open';
    if (!canView) {
      throw new AppError('Gig not found.', 404, 'not_found');
    }

    res.json({ id: gigId, ...gig });
  }),
);

/**
 * POST /api/gigs
 * Creates a new gig. Only clients and admins can post.
 */
gigsRouter.post(
  '/',
  requireRole(['client', 'admin']),
  asyncHandler(async (req, res) => {
    const payload = GigCreateSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const documentId = randomUUID();

    const gig: GigRecord = {
      ...payload,
      createdBy: req.profile!.uid,
      createdByRole: req.profile!.role,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`gigs/${documentId}`, gig, req.firebaseToken!);
    res.status(201).json({ id: documentId, ...gig });
  }),
);

/**
 * PATCH /api/gigs/:gigId
 * Partial update. Only the creator or an admin can update.
 * Creators cannot change createdBy, createdByRole, or createdAt.
 */
gigsRouter.patch(
  '/:gigId',
  asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const uid = req.profile!.uid;
    const isAdmin = req.profile!.role === 'admin';

    const existing = await getOptionalDocument<GigRecord>(`gigs/${gigId}`, req.firebaseToken!);

    if (!existing) {
      throw new AppError('Gig not found.', 404, 'not_found');
    }

    if (!isAdmin && existing.createdBy !== uid) {
      throw new AppError('You do not have permission to update this gig.', 403, 'forbidden');
    }

    const patch = GigPatchSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const updatePayload = { ...patch, updatedAt: timestamp };

    await setDocument(`gigs/${gigId}`, updatePayload, req.firebaseToken!, { merge: true });
    res.json({ id: gigId, ...existing, ...updatePayload });
  }),
);

/**
 * DELETE /api/gigs/:gigId
 * Soft-delete by setting status to 'closed'. Hard-delete requires admin.
 * We use soft-delete (status: closed) as the default to preserve audit history.
 */
gigsRouter.delete(
  '/:gigId',
  asyncHandler(async (req, res) => {
    const { gigId } = req.params;
    const uid = req.profile!.uid;
    const isAdmin = req.profile!.role === 'admin';

    const existing = await getOptionalDocument<GigRecord>(`gigs/${gigId}`, req.firebaseToken!);

    if (!existing) {
      throw new AppError('Gig not found.', 404, 'not_found');
    }

    if (!isAdmin && existing.createdBy !== uid) {
      throw new AppError('You do not have permission to delete this gig.', 403, 'forbidden');
    }

    const timestamp = new Date().toISOString();
    await setDocument(
      `gigs/${gigId}`,
      { status: 'closed', updatedAt: timestamp },
      req.firebaseToken!,
      { merge: true },
    );

    res.status(200).json({ id: gigId, deleted: true, status: 'closed' });
  }),
);
