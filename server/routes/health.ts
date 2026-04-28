import { Router } from 'express';
import { env } from '../env.ts';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    services: {
      firebase: env.firebaseConfigured,
      storage: env.storageConfigured,
      stripe: env.stripeConfigured,
      mpesa: env.mpesaConfigured,
    },
  });
});
