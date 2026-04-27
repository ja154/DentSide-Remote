import { createHmac, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { AppError } from '../errors.ts';
import { env } from '../env.ts';
import { StripeWebhookSchema } from '../schemas.ts';
import { asyncHandler } from '../utils/async-handler.ts';

const parseStripeSignatureHeader = (header: string) => {
  const parts = header.split(',').map((item) => item.trim());
  const values = Object.fromEntries(parts.map((part) => part.split('=')));

  return {
    timestamp: values.t,
    signature: values.v1,
  };
};

const verifyStripeSignature = (payload: Buffer, header: string, secret: string) => {
  const { timestamp, signature } = parseStripeSignatureHeader(header);

  if (!timestamp || !signature) {
    throw new AppError('Malformed stripe-signature header.', 400, 'bad_request');
  }

  const signedPayload = `${timestamp}.${payload.toString('utf8')}`;
  const expectedSignature = createHmac('sha256', secret).update(signedPayload).digest('hex');

  const provided = Buffer.from(signature, 'utf8');
  const expected = Buffer.from(expectedSignature, 'utf8');

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new AppError('Invalid Stripe webhook signature.', 400, 'bad_request');
  }
};

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError('Stripe webhook handling is not configured.', 503, 'not_configured');
    }

    const signature = req.header('stripe-signature');

    if (!signature) {
      throw new AppError('Missing stripe-signature header.', 400, 'bad_request');
    }

    const rawPayload = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');
    verifyStripeSignature(rawPayload, signature, env.STRIPE_WEBHOOK_SECRET);

    const event = StripeWebhookSchema.parse(JSON.parse(rawPayload.toString('utf8')));

    console.info(
      JSON.stringify({
        level: 'info',
        event: 'stripe_webhook_received',
        requestId: req.requestId,
        stripeEventId: event.id,
        stripeEventType: event.type,
      }),
    );

    res.status(202).json({
      received: true,
      type: event.type,
      configured: env.stripeConfigured,
    });
  }),
);
