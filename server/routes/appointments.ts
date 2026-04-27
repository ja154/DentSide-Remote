import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { AppointmentCreateSchema } from '../schemas.ts';
import { listDocuments, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { AppointmentRecord } from '../types.ts';

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth, loadUserProfile, ensureProfile);

appointmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const documents = await listDocuments<AppointmentRecord>('bookings', req.firebaseToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const appointments = documents.filter((appointment) => {
      if (req.profile!.role === 'admin') return true;
      if (req.profile!.role === 'client') return appointment.clientId === req.profile!.uid;
      return appointment.dentistId === req.profile!.uid;
    });

    res.json(appointments.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)));
  }),
);

appointmentsRouter.post(
  '/',
  requireRole(['client', 'admin']),
  asyncHandler(async (req, res) => {
    const payload = AppointmentCreateSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const documentId = randomUUID();

    const appointment: AppointmentRecord = {
      clientId: req.profile!.uid,
      clientName: req.profile!.displayName || req.firebaseUser?.displayName || req.profile!.email,
      dentistId: payload.dentistId,
      dentistName: payload.dentistName,
      reason: payload.reason,
      scheduledFor: payload.scheduledFor,
      status: 'requested',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`bookings/${documentId}`, appointment, req.firebaseToken!);
    res.status(201).json({ id: documentId, ...appointment });
  }),
);
