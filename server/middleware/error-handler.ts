import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors.ts';

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  const requestId = req.requestId || res.locals.requestId;

  if (error instanceof SyntaxError) {
    res.status(400).json({ error: 'Invalid JSON payload', requestId, code: 'bad_request' });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Request validation failed',
      code: 'bad_request',
      issues: error.issues,
      requestId,
    });
    return;
  }

  if (error instanceof AppError) {
    console.error(`[${requestId}] ${error.code}: ${error.message}`);
    res.status(error.statusCode).json({ error: error.message, code: error.code, requestId });
    return;
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  console.error(`[${requestId}] internal_error: ${message}`);
  res.status(500).json({ error: 'Failed to process request', code: 'internal_error', requestId });
};
