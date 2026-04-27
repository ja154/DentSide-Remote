import cors, { type CorsOptions } from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { adminRouter } from './routes/admin.ts';
import { appointmentsRouter } from './routes/appointments.ts';
import { authRouter } from './routes/auth.ts';
import { gigsRouter } from './routes/gigs.ts';
import { healthRouter } from './routes/health.ts';
import { matchRouter } from './routes/match.ts';
import { stripeWebhookRouter } from './routes/stripe-webhook.ts';
import { verificationRouter } from './routes/verification.ts';
import { withdrawRouter } from './routes/withdraw.ts';
import { errorHandler } from './middleware/error-handler.ts';
import { requestContext } from './middleware/request-context.ts';
import { requestLogger } from './middleware/request-logger.ts';
import { env } from './env.ts';

export async function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestContext);
  app.use(requestLogger);
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhookRouter);
  app.use(express.json({ limit: '100kb' }));

  const corsOptions: CorsOptions = {
    origin:
      env.NODE_ENV === 'production'
        ? [env.APP_URL, ...env.allowedOrigins].filter(Boolean)
        : env.allowedOrigins.length > 0
          ? env.allowedOrigins
          : true,
    methods: ['GET', 'POST', 'PATCH'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const protectedLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many authenticated requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/health', healthRouter);
  app.use('/api/match', apiLimiter, matchRouter);
  app.use('/api/auth', protectedLimiter, authRouter);
  app.use('/api/gigs', protectedLimiter, gigsRouter);
  app.use('/api/verify', protectedLimiter, verificationRouter);
  app.use('/api/appointments', protectedLimiter, appointmentsRouter);
  app.use('/api/withdraw', protectedLimiter, withdrawRouter);
  app.use('/api/admin', protectedLimiter, adminRouter);

  if (env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const spaFallbackLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use(express.static(distPath));
    app.get('*', spaFallbackLimiter, (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
