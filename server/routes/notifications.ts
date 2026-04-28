import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors.ts';
import { getOptionalDocument, listDocuments, setDocument } from '../services/firebase-rest.ts';
import { ensureProfile, loadUserProfile, requireAuth } from '../middleware/auth.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { NotificationRecord } from '../types.ts';

const NotificationPatchSchema = z.object({
  read: z.boolean(),
});

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, loadUserProfile, ensureProfile);

/**
 * GET /api/notifications
 * Returns notifications for the current user, newest first.
 * Supports ?unread=true to filter to unread only.
 */
notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const uid = req.profile!.uid;

    const documents = await listDocuments<NotificationRecord>(
      'notifications',
      req.firebaseToken!,
      { pageSize: 50 },
    );

    const unreadOnly = req.query.unread === 'true';

    const notifications = documents
      .filter((n) => n.userId === uid)
      .filter((n) => !unreadOnly || !n.read)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  }),
);

/**
 * PATCH /api/notifications/:notificationId
 * Mark a notification as read or unread.
 */
notificationsRouter.patch(
  '/:notificationId',
  asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const uid = req.profile!.uid;

    const existing = await getOptionalDocument<NotificationRecord>(
      `notifications/${notificationId}`,
      req.firebaseToken!,
    );

    if (!existing) {
      throw new AppError('Notification not found.', 404, 'not_found');
    }

    if (existing.userId !== uid) {
      throw new AppError('You do not have access to this notification.', 403, 'forbidden');
    }

    const patch = NotificationPatchSchema.parse(req.body);
    const timestamp = new Date().toISOString();

    await setDocument(
      `notifications/${notificationId}`,
      { read: patch.read, updatedAt: timestamp },
      req.firebaseToken!,
      { merge: true },
    );

    res.json({ id: notificationId, ...existing, read: patch.read, updatedAt: timestamp });
  }),
);

/**
 * POST /api/notifications/read-all
 * Mark all notifications for the current user as read.
 */
notificationsRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const uid = req.profile!.uid;
    const timestamp = new Date().toISOString();

    const documents = await listDocuments<NotificationRecord>(
      'notifications',
      req.firebaseToken!,
      { pageSize: 50 },
    );

    const unread = documents.filter((n) => n.userId === uid && !n.read);

    // Fire all updates in parallel - each is a light PATCH
    await Promise.all(
      unread.map((n) =>
        setDocument(
          `notifications/${n.userId}_${n.createdAt}`,
          { read: true, updatedAt: timestamp },
          req.firebaseToken!,
          { merge: true },
        ).catch(() => null), // best-effort; don't fail the whole request
      ),
    );

    res.json({ markedRead: unread.length });
  }),
);

/**
 * createNotification - internal helper for other routes to call.
 * This is not exposed as an HTTP endpoint directly; use it server-side.
 */
export const createNotification = async (
  notification: Omit<NotificationRecord, 'read' | 'createdAt' | 'updatedAt'>,
  token: string,
): Promise<void> => {
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  await setDocument(
    `notifications/${id}`,
    {
      ...notification,
      read: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    token,
  );
};
