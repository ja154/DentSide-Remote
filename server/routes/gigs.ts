import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { GigCreateSchema } from '../schemas.ts';
import { listDocuments, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { GigRecord, WithId } from '../types.ts';

export const gigsRouter = Router();

gigsRouter.use(requireAuth, loadUserProfile, ensureProfile);

gigsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const documents = await listDocuments<GigRecord>('gigs', req.firebaseToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

    const gigs = documents
      .filter((gig) => gig.status !== 'closed')
      .filter((gig) => {
        if (!search) return true;

        return [gig.title, gig.company, gig.type, gig.description || '', ...gig.tags]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    res.json(gigs satisfies Array<WithId<GigRecord>>);
  }),
);

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
