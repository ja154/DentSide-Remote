import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.ts';
import { handleMpesaResultCallback, handleMpesaTimeoutCallback } from '../services/mpesa.ts';

export const mpesaWebhookRouter = Router();

mpesaWebhookRouter.post(
  '/result',
  asyncHandler(async (req, res) => {
    await handleMpesaResultCallback(req.body).catch(() => false);
    res.status(200).json({ accepted: true });
  }),
);

mpesaWebhookRouter.post(
  '/timeout',
  asyncHandler(async (req, res) => {
    await handleMpesaTimeoutCallback(req.body).catch(() => false);
    res.status(200).json({ accepted: true });
  }),
);
