import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { authConfigured as runtimeAuthConfigured } from './runtime-config';
import { supabase } from './supabase';

export interface AuthUser {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  providerIds: string[];
  getIdToken: () => Promise<string>;
}

type AuthStateListener = (user: AuthUser | null) => void;

export const authConfigured = runtimeAuthConfigured;

let currentAuthUser: AuthUser | null = null;
let authBootstrapped = false;
let authBootstrapPromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
const authStateListeners = new Set<AuthStateListener>();

const assertSupabaseConfigured = () => {
  if (!authConfigured) {
    throw new Error(
      'Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
};

const getSupabaseDisplayName = (user: User) => {
  const metadata = user.user_metadata || {};
  const displayName = metadata.displayName;
  const fullName = metadata.full_name;
  const name = metadata.name;

  if (typeof displayName === 'string' && displayName.trim()) return displayName.trim();
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();
  if (typeof name === 'string' && name.trim()) return name.trim();

  return undefined;
};

const getSupabasePhotoUrl = (user: User) => {
  const metadata = user.user_metadata || {};
  const avatarUrl = metadata.avatar_url;
  const picture = metadata.picture;

  if (typeof avatarUrl === 'string' && avatarUrl.trim()) return avatarUrl.trim();
  if (typeof picture === 'string' && picture.trim()) return picture.trim();

  return undefined;
};

const getProviderIds = (user: User) => {
  const fromAppMetadata = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers.filter((provider): provider is string => typeof provider === 'string')
    : [];
  const fromIdentities = (user.identities || [])
    .map((identity) => identity.provider || '')
    .filter(Boolean);
  const baseProvider = user.app_metadata?.provider ? [user.app_metadata.provider] : [];

  return Array.from(new Set([...baseProvider, ...fromAppMetadata, ...fromIdentities]));
};

const toAuthUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null;
  }

  return {
    uid: user.id,
    email: user.email || undefined,
    phoneNumber: user.phone || undefined,
    displayName: getSupabaseDisplayName(user),
    photoURL: getSupabasePhotoUrl(user),
    emailVerified: Boolean(user.email_confirmed_at),
    phoneVerified: Boolean(user.phone_confirmed_at),
    providerIds: getProviderIds(user),
    getIdToken: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active Supabase session.');
      }

      return session.access_token;
    },
  };
};

const emitAuthState = () => {
  authStateListeners.forEach((listener) => listener(currentAuthUser));
};

const syncFromSession = (session: Session | null) => {
  currentAuthUser = toAuthUser(session?.user || null);
  emitAuthState();
};

const bootstrapAuthState = async () => {
  if (authBootstrapped) {
    return;
  }

  if (authBootstrapPromise) {
    return authBootstrapPromise;
  }

  authBootstrapPromise = (async () => {
    if (!authConfigured || typeof window === 'undefined') {
      authBootstrapped = true;
      currentAuthUser = null;
      emitAuthState();
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    syncFromSession(session);

    if (!authSubscription) {
      const { data } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, nextSession: Session | null) => {
          syncFromSession(nextSession);
        },
      );

      authSubscription = {
        unsubscribe: () => data.subscription.unsubscribe(),
      };
    }

    authBootstrapped = true;
  })().finally(() => {
    authBootstrapPromise = null;
  });

  return authBootstrapPromise;
};

export const getCurrentUser = () => currentAuthUser;

export const getAccessToken = async () => {
  await bootstrapAuthState();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
};

export const onAuthStateChanged = (listener: AuthStateListener) => {
  authStateListeners.add(listener);
  void bootstrapAuthState();

  if (authBootstrapped) {
    listener(currentAuthUser);
  }

  return () => {
    authStateListeners.delete(listener);
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
};

export const signUpWithEmail = async ({
  email,
  password,
  displayName,
}: {
  email: string;
  password: string;
  displayName?: string;
}) => {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName
        ? {
            displayName,
            full_name: displayName,
          }
        : undefined,
    },
  });

  if (error) {
    throw error;
  }
};

export const signInWithPhoneOtp = async ({
  phone,
  displayName,
}: {
  phone: string;
  displayName?: string;
}) => {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
      data: displayName
        ? {
            displayName,
            full_name: displayName,
          }
        : undefined,
    },
  });

  if (error) {
    throw error;
  }
};

export const resendPhoneOtp = async ({
  phone,
  displayName,
}: {
  phone: string;
  displayName?: string;
}) => {
  await signInWithPhoneOtp({ phone, displayName });
};

export const verifyPhoneOtp = async ({
  phone,
  token,
}: {
  phone: string;
  token: string;
}) => {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) {
    throw error;
  }

  syncFromSession(data.session || null);
  return data;
};

export const signInWithGoogle = async () => {
  assertSupabaseConfigured();

  if (typeof window === 'undefined') {
    throw new Error('Google sign-in requires a browser environment.');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw error;
  }
};

export const signOut = async () => {
  if (authConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }

  currentAuthUser = null;
  emitAuthState();
};
