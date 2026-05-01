import {
  authConfigured as runtimeAuthConfigured,
  supabaseConfig,
} from './runtime-config';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  providerIds: string[];
  getIdToken: () => Promise<string>;
}

type AuthStateListener = (user: AuthUser | null) => void;

type SupabaseUserPayload = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, unknown>;
  identities?: Array<{ provider?: string | null }>;
};

type SupabaseSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: SupabaseUserPayload;
};

type SupabaseAuthPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseUserPayload;
  error_description?: string;
  msg?: string;
  message?: string;
};

const SUPABASE_SESSION_STORAGE_KEY = 'dentside.supabase.session';
const SUPABASE_REFRESH_BUFFER_MS = 60_000;

export const authConfigured = runtimeAuthConfigured;

let supabaseSession: SupabaseSession | null = null;
let supabaseBootstrapped = false;
let supabaseBootstrapPromise: Promise<void> | null = null;
const supabaseListeners = new Set<AuthStateListener>();

const canUseBrowserStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getSupabaseDisplayName = (user: SupabaseUserPayload) => {
  const metadata = user.user_metadata || {};
  const displayName = metadata.displayName;
  const fullName = metadata.full_name;
  const name = metadata.name;

  if (typeof displayName === 'string' && displayName.trim()) return displayName.trim();
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim();
  if (typeof name === 'string' && name.trim()) return name.trim();

  return undefined;
};

const getSupabasePhotoUrl = (user: SupabaseUserPayload) => {
  const metadata = user.user_metadata || {};
  const avatarUrl = metadata.avatar_url;
  const picture = metadata.picture;

  if (typeof avatarUrl === 'string' && avatarUrl.trim()) return avatarUrl.trim();
  if (typeof picture === 'string' && picture.trim()) return picture.trim();

  return undefined;
};

const getSupabaseProviderIds = (user: SupabaseUserPayload) => {
  const fromAppMetadata = user.app_metadata?.providers || [];
  const fromIdentities = (user.identities || [])
    .map((identity) => identity.provider || '')
    .filter(Boolean);
  const baseProvider = user.app_metadata?.provider ? [user.app_metadata.provider] : [];

  return Array.from(new Set([...baseProvider, ...fromAppMetadata, ...fromIdentities]));
};

const toAuthUser = (session: SupabaseSession): AuthUser => ({
  uid: session.user.id,
  email: session.user.email || '',
  displayName: getSupabaseDisplayName(session.user),
  photoURL: getSupabasePhotoUrl(session.user),
  emailVerified: Boolean(session.user.email_confirmed_at),
  providerIds: getSupabaseProviderIds(session.user),
  getIdToken: async () => {
    const nextSession = await ensureFreshSupabaseSession();
    return nextSession.accessToken;
  },
});

const emitAuthState = () => {
  const nextUser = supabaseSession ? toAuthUser(supabaseSession) : null;
  supabaseListeners.forEach((listener) => listener(nextUser));
};

const readStoredSession = (): SupabaseSession | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(SUPABASE_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SupabaseSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const persistSession = (session: SupabaseSession | null) => {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SUPABASE_SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SUPABASE_SESSION_STORAGE_KEY, JSON.stringify(session));
};

const setSession = (session: SupabaseSession | null) => {
  supabaseSession = session;
  persistSession(session);
  emitAuthState();
};

const clearSupabaseCallbackHash = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, document.title, nextUrl);
};

const assertSupabaseConfigured = () => {
  if (!authConfigured) {
    throw new Error(
      'Supabase auth is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
};

const getSupabaseAuthUrl = (path: string) =>
  `${supabaseConfig.url.replace(/\/+$/, '')}${path}`;

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseSupabaseError = (payload: unknown, fallback: string) => {
  if (typeof payload === 'object' && payload) {
    if ('msg' in payload && typeof payload.msg === 'string') {
      return payload.msg;
    }

    if ('error_description' in payload && typeof payload.error_description === 'string') {
      return payload.error_description;
    }

    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }
  }

  return fallback;
};

const supabaseRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  assertSupabaseConfigured();

  const response = await fetch(getSupabaseAuthUrl(path), {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: supabaseConfig.anonKey,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw new Error(parseSupabaseError(payload, `Supabase request failed with ${response.status}.`));
  }

  return payload as T;
};

const createSessionFromPayload = (payload: SupabaseAuthPayload): SupabaseSession | null => {
  if (!payload.access_token || !payload.refresh_token || !payload.user) {
    return null;
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
    user: payload.user,
  };
};

const refreshSession = async (refreshToken: string) => {
  const payload = await supabaseRequest<SupabaseAuthPayload>(
    '/auth/v1/token?grant_type=refresh_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );
  const nextSession = createSessionFromPayload(payload);

  if (!nextSession) {
    throw new Error('Supabase refresh did not return a valid session.');
  }

  setSession(nextSession);
  return nextSession;
};

const ensureFreshSupabaseSession = async (): Promise<SupabaseSession> => {
  if (!supabaseSession) {
    const stored = readStoredSession();
    if (stored) {
      supabaseSession = stored;
    }
  }

  if (!supabaseSession) {
    throw new Error('No active Supabase session.');
  }

  if (supabaseSession.expiresAt - Date.now() > SUPABASE_REFRESH_BUFFER_MS) {
    return supabaseSession;
  }

  return refreshSession(supabaseSession.refreshToken);
};

const bootstrapSupabaseSession = async () => {
  if (supabaseBootstrapped) {
    return;
  }

  if (supabaseBootstrapPromise) {
    return supabaseBootstrapPromise;
  }

  supabaseBootstrapPromise = (async () => {
    if (!authConfigured || typeof window === 'undefined') {
      supabaseBootstrapped = true;
      emitAuthState();
      return;
    }

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    if (hashParams.get('access_token') && hashParams.get('refresh_token')) {
      const accessToken = hashParams.get('access_token') || '';
      const refreshToken = hashParams.get('refresh_token') || '';

      if (accessToken && refreshToken) {
        const user = await supabaseRequest<SupabaseUserPayload>('/auth/v1/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setSession({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + Number(hashParams.get('expires_in') || '3600') * 1000,
          user,
        });
      }

      clearSupabaseCallbackHash();
    } else {
      supabaseSession = readStoredSession();
      if (supabaseSession) {
        try {
          await ensureFreshSupabaseSession();
        } catch {
          setSession(null);
        }
      } else {
        emitAuthState();
      }
    }

    emitAuthState();
    supabaseBootstrapped = true;
  })().finally(() => {
    supabaseBootstrapPromise = null;
  });

  return supabaseBootstrapPromise;
};

export const getCurrentUser = () => (supabaseSession ? toAuthUser(supabaseSession) : null);

export const getAccessToken = async () => {
  await bootstrapSupabaseSession();

  if (!supabaseSession) {
    return null;
  }

  const session = await ensureFreshSupabaseSession();
  return session.accessToken;
};

export const onAuthStateChanged = (listener: AuthStateListener) => {
  supabaseListeners.add(listener);
  void bootstrapSupabaseSession();

  if (supabaseBootstrapped) {
    listener(getCurrentUser());
  }

  return () => {
    supabaseListeners.delete(listener);
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  const payload = await supabaseRequest<SupabaseAuthPayload>(
    '/auth/v1/token?grant_type=password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    },
  );
  const session = createSessionFromPayload(payload);

  if (!session) {
    throw new Error('Supabase sign-in did not return a valid session.');
  }

  setSession(session);
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
  const payload = await supabaseRequest<SupabaseAuthPayload>('/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: displayName
        ? {
            displayName,
            full_name: displayName,
          }
        : undefined,
    }),
  });
  const session = createSessionFromPayload(payload);

  if (!session) {
    throw new Error(
      'Supabase sign-up completed, but no active session was returned. Check whether email confirmation is enabled.',
    );
  }

  setSession(session);
};

export const signInWithGoogle = async () => {
  assertSupabaseConfigured();

  if (typeof window === 'undefined') {
    throw new Error('Google sign-in requires a browser environment.');
  }

  const redirectTo = `${window.location.origin}/login`;
  const url = new URL(getSupabaseAuthUrl('/auth/v1/authorize'));
  url.searchParams.set('provider', 'google');
  url.searchParams.set('redirect_to', redirectTo);
  window.location.assign(url.toString());
};

export const signOut = async () => {
  if (supabaseSession) {
    await supabaseRequest('/auth/v1/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseSession.accessToken}`,
      },
    }).catch(() => null);
  }

  setSession(null);
};
