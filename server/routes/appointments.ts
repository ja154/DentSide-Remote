import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.ts';
import { AppointmentCreateSchema, AppointmentPatchSchema } from '../schemas.ts';
import { getOptionalDocument, listDocuments, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth, requireRole } from '../middleware/auth.ts';
import { createNotification } from './notifications.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { AppointmentRecord, BookingStatus } from '../types.ts';

export const appointmentsRouter = Router();

appointmentsRouter.use(requireAuth, loadUserProfile, ensureProfile);

/**
 * GET /api/appointments
 * - Admin: all appointments
 * - Dentist: appointments assigned to them
 * - Client: their own bookings
 */
appointmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const documents = await listDocuments<AppointmentRecord>('bookings', req.firebaseToken!, {
      pageSize: 100,
      orderBy: 'updatedAt desc',
    });

    const role = req.profile!.role;
    const uid = req.profile!.uid;

    const appointments = documents
      .filter((a) => {
        if (role === 'admin') return true;
        if (role === 'client') return a.clientId === uid;
        return a.dentistId === uid;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    res.json(appointments);
  }),
);

/**
 * GET /api/appointments/:appointmentId
 * Fetch a single appointment — only accessible by the client, assigned dentist, or admin.
 */
appointmentsRouter.get(
  '/:appointmentId',
  asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const uid = req.profile!.uid;
    const role = req.profile!.role;

    const appointment = await getOptionalDocument<AppointmentRecord>(
      `bookings/${appointmentId}`,
      req.firebaseToken!,
    );

    if (!appointment) {
      throw new AppError('Appointment not found.', 404, 'not_found');
    }

    const canAccess =
      role === 'admin' ||
      appointment.clientId === uid ||
      appointment.dentistId === uid;

    if (!canAccess) {
      throw new AppError('You do not have access to this appointment.', 403, 'forbidden');
    }

    res.json({ id: appointmentId, ...appointment });
  }),
);

/**
 * POST /api/appointments
 * Creates a new appointment. Only clients and admins can initiate.
 */
appointmentsRouter.post(
  '/',
  requireRole(['client', 'admin']),
  asyncHandler(async (req, res) => {
    const payload = AppointmentCreateSchema.parse(req.body);
    const timestamp = new Date().toISOString();
    const documentId = randomUUID();

    const appointment: AppointmentRecord = {
      clientId: req.profile!.uid,
      clientName:
        req.profile!.displayName || req.firebaseUser?.displayName || req.profile!.email,
      dentistId: payload.dentistId,
      dentistName: payload.dentistName,
      reason: payload.reason,
      scheduledFor: payload.scheduledFor,
      status: 'requested',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await setDocument(`bookings/${documentId}`, appointment, req.firebaseToken!);

    if (appointment.dentistId) {
      await createNotification(
        {
          userId: appointment.dentistId,
          type: 'new_appointment_request',
          title: 'New appointment request',
          body: `${appointment.clientName} requested a consult${appointment.scheduledFor ? ` for ${appointment.scheduledFor}` : '.'}`,
          relatedId: documentId,
        },
        req.firebaseToken!,
      ).catch(() => null);
    }

    res.status(201).json({ id: documentId, ...appointment });
  }),
);

/**
 * PATCH /api/appointments/:appointmentId
 * Update appointment status or scheduling details.
 *
 * Allowed transitions:
 *   Client: requested → cancelled
 *   Dentist: requested → confirmed, confirmed → completed, * → cancelled
 *   Admin: any transition
 */
appointmentsRouter.patch(
  '/:appointmentId',
  asyncHandler(async (req, res) => {
    const { appointmentId } = req.params;
    const uid = req.profile!.uid;
    const role = req.profile!.role;

    const existing = await getOptionalDocument<AppointmentRecord>(
      `bookings/${appointmentId}`,
      req.firebaseToken!,
    );

    if (!existing) {
      throw new AppError('Appointment not found.', 404, 'not_found');
    }

    const canAccess =
      role === 'admin' ||
      existing.clientId === uid ||
      existing.dentistId === uid;

    if (!canAccess) {
      throw new AppError('You do not have access to this appointment.', 403, 'forbidden');
    }

    const patch = AppointmentPatchSchema.parse(req.body);

    // Enforce transition rules for non-admins
    if (role !== 'admin') {
      const currentStatus = existing.status as BookingStatus;
      const nextStatus = patch.status;

      const ALLOWED_TRANSITIONS: Record<string, Record<BookingStatus, BookingStatus[]>> = {
        client: {
          requested: ['cancelled'],
          confirmed: ['cancelled'],
          completed: [],
          cancelled: [],
        },
        dentist: {
          requested: ['confirmed', 'cancelled'],
          confirmed: ['completed', 'cancelled'],
          completed: [],
          cancelled: [],
        },
      };

      const allowed = ALLOWED_TRANSITIONS[role]?.[currentStatus] ?? [];
      if (!allowed.includes(nextStatus)) {
        throw new AppError(
          `Transition from "${currentStatus}" to "${nextStatus}" is not permitted for your role.`,
          403,
          'forbidden',
        );
      }
    }

    const timestamp = new Date().toISOString();
    const updatePayload: Partial<AppointmentRecord> = {
      status: patch.status,
      updatedAt: timestamp,
    };

    if (patch.scheduledFor !== undefined) updatePayload.scheduledFor = patch.scheduledFor;
    if (patch.dentistId !== undefined) updatePayload.dentistId = patch.dentistId;
    if (patch.dentistName !== undefined) updatePayload.dentistName = patch.dentistName;

    await setDocument(`bookings/${appointmentId}`, updatePayload, req.firebaseToken!, {
      merge: true,
    });

    const nextAppointment = { id: appointmentId, ...existing, ...updatePayload };

    if (patch.status === 'confirmed') {
      await createNotification(
        {
          userId: existing.clientId,
          type: 'appointment_confirmed',
          title: 'Appointment confirmed',
          body: `${existing.dentistName || patch.dentistName || 'Your dentist'} confirmed your consult request.`,
          relatedId: appointmentId,
        },
        req.firebaseToken!,
      ).catch(() => null);
    }

    if (patch.status === 'completed') {
      await createNotification(
        {
          userId: existing.clientId,
          type: 'appointment_completed',
          title: 'Appointment completed',
          body: `${existing.dentistName || patch.dentistName || 'Your dentist'} marked the consult as completed.`,
          relatedId: appointmentId,
        },
        req.firebaseToken!,
      ).catch(() => null);
    }

    if (patch.status === 'cancelled') {
      const notificationTargets = new Set<string>();

      if (role === 'client' && existing.dentistId) {
        notificationTargets.add(existing.dentistId);
      }

      if ((role === 'dentist' || role === 'admin') && existing.clientId) {
        notificationTargets.add(existing.clientId);
      }

      await Promise.all(
        Array.from(notificationTargets).map((targetUserId) =>
          createNotification(
            {
              userId: targetUserId,
              type: 'appointment_cancelled',
              title: 'Appointment cancelled',
              body:
                role === 'client'
                  ? `${existing.clientName} cancelled the consult request.`
                  : `${existing.dentistName || patch.dentistName || 'Your dentist'} cancelled the consult.`,
              relatedId: appointmentId,
            },
            req.firebaseToken!,
          ).catch(() => null),
        ),
      );
    }

    res.json(nextAppointment);
  }),
);
