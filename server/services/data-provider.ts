import { AppError } from '../errors.ts';
import { env } from '../env.ts';
import type { AuthIdentity, WithId } from '../types.ts';

type SupabaseUserPayload = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: Record<string, unknown>;
};

type TokenCacheEntry = {
  identity: AuthIdentity;
  expiresAt: number;
};

const TOKEN_CACHE_TTL_MS = 55 * 60 * 1000;
const TOKEN_CACHE_MAX_ENTRIES = 200;
const tokenCache = new Map<string, TokenCacheEntry>();

const assertSupabaseConfigured = () => {
  if (!env.supabaseConfigured) {
    throw new AppError(
      'Supabase server routes are not configured. Add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.',
      503,
      'not_configured',
    );
  }
};

const getSupabaseBaseUrl = () => `${env.SUPABASE_URL!.replace(/\/+$/, '')}/rest/v1`;
const getSupabaseAuthUrl = () => `${env.SUPABASE_URL!.replace(/\/+$/, '')}/auth/v1`;

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const parseUpstreamErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload === 'object' && payload !== null) {
    if (
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
    ) {
      return payload.error.message;
    }

    if ('message' in payload && typeof payload.message === 'string') {
      return payload.message;
    }

    if ('msg' in payload && typeof payload.msg === 'string') {
      return payload.msg;
    }

    if ('error_description' in payload && typeof payload.error_description === 'string') {
      return payload.error_description;
    }
  }

  return fallback;
};

const buildUpstreamError = (status: number, message: string) => {
  if (status === 400) {
    return new AppError(message || 'Invalid upstream request.', 400, 'bad_request');
  }

  if (status === 401) {
    return new AppError(message || 'Unauthorized request.', 401, 'unauthorized');
  }

  if (status === 403) {
    return new AppError(message || 'Forbidden request.', 403, 'forbidden');
  }

  if (status === 404) {
    return new AppError(message || 'Requested document was not found.', 404, 'not_found');
  }

  return new AppError(message || 'Upstream provider request failed.', 502, 'upstream_error');
};

const requestJson = async <T>(url: string, init: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upstream request failed.';
    throw new AppError(message, 502, 'upstream_error');
  }

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    throw buildUpstreamError(
      response.status,
      parseUpstreamErrorMessage(payload, response.statusText),
    );
  }

  return payload as T;
};

const supabaseServiceHeaders = () => ({
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  apikey: env.SUPABASE_SERVICE_ROLE_KEY!,
});

const parseDocumentPath = (documentPath: string) => {
  const [collection, documentId] = documentPath.split('/').filter(Boolean);

  if (!collection) {
    throw new AppError('Invalid document path.', 500, 'internal_error');
  }

  return { collection, documentId };
};

const buildTableUrl = (collection: string, searchParams?: URLSearchParams) => {
  const url = `${getSupabaseBaseUrl()}/${collection}`;
  return searchParams ? `${url}?${searchParams.toString()}` : url;
};

const normalizeSupabaseRow = <T>(row: Record<string, unknown>) => {
  const { id, ...rest } = row;
  return {
    id: typeof id === 'string' ? id : String(id),
    data: rest as T,
  };
};

const toSupabaseOrder = (orderBy?: string) => {
  if (!orderBy) {
    return null;
  }

  const [column, direction = 'asc'] = orderBy.trim().split(/\s+/);
  if (!column) {
    return null;
  }

  return `${column}.${direction.toLowerCase() === 'desc' ? 'desc' : 'asc'}`;
};

const cacheTokenIdentity = (token: string, identity: AuthIdentity) => {
  if (tokenCache.size >= TOKEN_CACHE_MAX_ENTRIES) {
    const firstKey = tokenCache.keys().next().value;
    if (firstKey) tokenCache.delete(firstKey);
  }

  tokenCache.set(token, {
    identity,
    expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
  });
};

const getCachedIdentity = (token: string) => {
  const cached = tokenCache.get(token);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.identity;
  }

  if (cached) {
    tokenCache.delete(token);
  }

  return null;
};

const mapSupabaseUser = (user: SupabaseUserPayload): AuthIdentity => {
  const metadata = user.user_metadata || {};
  const displayName =
    typeof metadata.displayName === 'string'
      ? metadata.displayName
      : typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : undefined;
  const photoURL =
    typeof metadata.avatar_url === 'string'
      ? metadata.avatar_url
      : typeof metadata.picture === 'string'
        ? metadata.picture
        : undefined;

  if (!user.id || !user.email) {
    throw new AppError('Invalid Supabase access token.', 401, 'unauthorized');
  }

  return {
    uid: user.id,
    email: user.email,
    displayName,
    photoURL,
    emailVerified: Boolean(user.email_confirmed_at),
  };
};

export const validateAuthToken = async (token: string): Promise<AuthIdentity> => {
  const cached = getCachedIdentity(token);
  if (cached) {
    return cached;
  }

  assertSupabaseConfigured();

  const user = await requestJson<SupabaseUserPayload>(`${getSupabaseAuthUrl()}/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY!,
    },
  });

  const identity = mapSupabaseUser(user);
  cacheTokenIdentity(token, identity);
  return identity;
};

export const getDocument = async <T>(documentPath: string, authToken: string): Promise<T> => {
  void authToken;
  assertSupabaseConfigured();

  const { collection, documentId } = parseDocumentPath(documentPath);

  if (!documentId) {
    throw new AppError('Document paths must include a record id.', 500, 'internal_error');
  }

  const searchParams = new URLSearchParams();
  searchParams.set('select', '*');
  searchParams.set('id', `eq.${documentId}`);
  searchParams.set('limit', '1');

  const rows = await requestJson<Array<Record<string, unknown>>>(
    buildTableUrl(collection, searchParams),
    {
      method: 'GET',
      headers: supabaseServiceHeaders(),
    },
  );

  const row = rows[0];
  if (!row) {
    throw new AppError('Requested document was not found.', 404, 'not_found');
  }

  return normalizeSupabaseRow<T>(row).data;
};

export const getOptionalDocument = async <T>(
  documentPath: string,
  authToken: string,
): Promise<T | null> => {
  try {
    return await getDocument<T>(documentPath, authToken);
  } catch (error) {
    if (error instanceof AppError && error.code === 'not_found') {
      return null;
    }

    throw error;
  }
};

export const setDocument = async <T extends object>(
  documentPath: string,
  data: T,
  authToken: string,
  options?: { merge?: boolean },
): Promise<void> => {
  void authToken;
  void options;
  assertSupabaseConfigured();

  const { collection, documentId } = parseDocumentPath(documentPath);

  if (!documentId) {
    throw new AppError('Document paths must include a record id.', 500, 'internal_error');
  }

  const searchParams = new URLSearchParams();
  searchParams.set('on_conflict', 'id');

  await requestJson(buildTableUrl(collection, searchParams), {
    method: 'POST',
    headers: {
      ...supabaseServiceHeaders(),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: documentId, ...data }),
  });
};

export const listDocuments = async <T>(
  collectionPath: string,
  authToken: string,
  options?: { pageSize?: number; orderBy?: string },
): Promise<Array<WithId<T>>> => {
  void authToken;
  assertSupabaseConfigured();

  const searchParams = new URLSearchParams();
  searchParams.set('select', '*');

  if (options?.pageSize) {
    searchParams.set('limit', String(options.pageSize));
  }

  const supabaseOrder = toSupabaseOrder(options?.orderBy);
  if (supabaseOrder) {
    searchParams.set('order', supabaseOrder);
  }

  const rows = await requestJson<Array<Record<string, unknown>>>(
    buildTableUrl(collectionPath, searchParams),
    {
      method: 'GET',
      headers: supabaseServiceHeaders(),
    },
  );

  return rows.map((row) => {
    const normalized = normalizeSupabaseRow<T>(row);
    return {
      id: normalized.id,
      ...normalized.data,
    };
  });
};
