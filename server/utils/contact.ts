import type { AuthIdentity, UserProfile } from '../types.ts';

export const getContactLabel = (
  profile: Pick<UserProfile, 'displayName' | 'email' | 'phoneNumber'> | null | undefined,
  fallback = 'User',
) => {
  if (!profile) {
    return fallback;
  }

  return profile.displayName || profile.email || profile.phoneNumber || fallback;
};

export const getIdentityContactLabel = (
  identity: Pick<AuthIdentity, 'displayName' | 'email' | 'phoneNumber'> | null | undefined,
  fallback = 'User',
) => {
  if (!identity) {
    return fallback;
  }

  return identity.displayName || identity.email || identity.phoneNumber || fallback;
};
