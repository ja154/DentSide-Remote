import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors.ts';
import { getOptionalDocument, validateFirebaseIdToken } from '../services/firebase-rest.ts';
import { asyncHandler } from '../utils/async-handler.ts';
import type { Role, UserProfile } from '../types.ts';

const extractBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
};

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.header('authorization'));

  if (!token) {
    throw new AppError('A Firebase bearer token is required for this route.', 401, 'unauthorized');
  }

  req.firebaseToken = token;
  req.firebaseUser = await validateFirebaseIdToken(token);
  next();
});

export const loadUserProfile = asyncHandler(async (req, _res, next) => {
  if (!req.firebaseToken || !req.firebaseUser) {
    throw new AppError('Authentication context is not available.', 401, 'unauthorized');
  }

  req.profile = await getOptionalDocument<UserProfile>(`users/${req.firebaseUser.uid}`, req.firebaseToken);
  next();
});

export const ensureProfile = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.profile) {
    next(new AppError('Complete profile setup before using this route.', 403, 'forbidden'));
    return;
  }

  next();
};

export const requireRole = (roles: Role | Role[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.profile) {
      next(new AppError('Complete profile setup before using this route.', 403, 'forbidden'));
      return;
    }

    if (!allowedRoles.includes(req.profile.role)) {
      next(new AppError('You do not have access to this resource.', 403, 'forbidden'));
      return;
    }

    next();
  };
};
