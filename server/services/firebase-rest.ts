import { AppError } from '../errors.ts';
import { env } from '../env.ts';
import type { FirebaseIdentity, WithId } from '../types.ts';

type FirestorePrimitive =
  | string
  | number
  | boolean
  | null
  | Date
  | FirestorePrimitive[]
  | { [key: string]: FirestorePrimitive | undefined };

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: 'NULL_VALUE';
  timestampValue?: string;
  mapValue?: { fields?: Record<string, FirestoreValue> };
  arrayValue?: { values?: FirestoreValue[] };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

const identityToolkitBaseUrl = 'https://identitytoolkit.googleapis.com/v1';

const getFirestoreBaseUrl = () => {
  return `https://firestore.googleapis.com/v1/projects/${env.VITE_FIREBASE_PROJECT_ID}/databases/${encodeURIComponent(env.VITE_FIREBASE_DATABASE_ID)}/documents`;
};

const assertFirebaseConfigured = () => {
  if (!env.firebaseConfigured) {
    throw new AppError(
      'Firebase server routes are not configured. Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.',
      503,
      'not_configured',
    );
  }
};

const buildGoogleError = (status: number, message: string) => {
  if (status === 401) {
    return new AppError(message || 'Unauthorized request.', 401, 'unauthorized');
  }

  if (status === 403) {
    return new AppError(message || 'Forbidden request.', 403, 'forbidden');
  }

  if (status === 404) {
    return new AppError(message || 'Requested document was not found.', 404, 'not_found');
  }

  return new AppError(message || 'Upstream Firebase request failed.', 502, 'upstream_error');
};

const requestJson = async <T>(url: string, init: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Firebase request failed.';
    throw new AppError(message, 502, 'upstream_error');
  }

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error &&
      typeof payload.error.message === 'string'
        ? payload.error.message
        : response.statusText;

    throw buildGoogleError(response.status, message);
  }

  return payload as T;
};

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const toFirestoreValue = (value: FirestorePrimitive): FirestoreValue => {
  if (value === null) {
    return { nullValue: 'NULL_VALUE' };
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => toFirestoreValue(item)),
      },
    };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value)
          .filter(([, nestedValue]) => nestedValue !== undefined)
          .map(([key, nestedValue]) => [key, toFirestoreValue(nestedValue as FirestorePrimitive)]),
      ),
    },
  };
};

const fromFirestoreValue = (value: FirestoreValue): unknown => {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return Number(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;

  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map((item) => fromFirestoreValue(item));
  }

  if (value.mapValue !== undefined) {
    return fromFirestoreFields(value.mapValue.fields || {});
  }

  return null;
};

const fromFirestoreFields = (fields: Record<string, FirestoreValue>) => {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]));
};

const toFirestoreFields = (data: Record<string, FirestorePrimitive | undefined>) => {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, toFirestoreValue(value as FirestorePrimitive)]),
  );
};

const getDocumentId = (documentName: string) => documentName.split('/').pop() || documentName;

const buildDocumentUrl = (documentPath: string, searchParams?: URLSearchParams) => {
  const url = `${getFirestoreBaseUrl()}/${documentPath}`;
  return searchParams ? `${url}?${searchParams.toString()}` : url;
};

export const validateFirebaseIdToken = async (idToken: string): Promise<FirebaseIdentity> => {
  assertFirebaseConfigured();

  const payload = await requestJson<{
    users?: Array<{
      localId: string;
      email?: string;
      displayName?: string;
      photoUrl?: string;
      emailVerified?: boolean;
    }>;
  }>(`${identityToolkitBaseUrl}/accounts:lookup?key=${env.VITE_FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const user = payload.users?.[0];

  if (!user?.localId || !user.email) {
    throw new AppError('Invalid Firebase ID token.', 401, 'unauthorized');
  }

  return {
    uid: user.localId,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoUrl,
    emailVerified: Boolean(user.emailVerified),
  };
};

export const getDocument = async <T>(documentPath: string, idToken: string): Promise<T> => {
  assertFirebaseConfigured();

  const document = await requestJson<FirestoreDocument>(buildDocumentUrl(documentPath), {
    method: 'GET',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  return fromFirestoreFields(document.fields || {}) as T;
};

export const getOptionalDocument = async <T>(documentPath: string, idToken: string): Promise<T | null> => {
  try {
    return await getDocument<T>(documentPath, idToken);
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
  idToken: string,
  options?: { merge?: boolean },
): Promise<void> => {
  assertFirebaseConfigured();

  const record = data as Record<string, FirestorePrimitive | undefined>;
  const searchParams = new URLSearchParams();
  const body = { fields: toFirestoreFields(record) };

  if (options?.merge) {
    Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .forEach((key) => searchParams.append('updateMask.fieldPaths', key));
  }

  await requestJson(buildDocumentUrl(documentPath, searchParams), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const listDocuments = async <T>(
  collectionPath: string,
  idToken: string,
  options?: { pageSize?: number; orderBy?: string },
): Promise<Array<WithId<T>>> => {
  assertFirebaseConfigured();

  const searchParams = new URLSearchParams();

  if (options?.pageSize) {
    searchParams.set('pageSize', String(options.pageSize));
  }

  if (options?.orderBy) {
    searchParams.set('orderBy', options.orderBy);
  }

  const payload = await requestJson<{ documents?: FirestoreDocument[] }>(buildDocumentUrl(collectionPath, searchParams), {
    method: 'GET',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  return (payload.documents || []).map((document) => ({
    id: getDocumentId(document.name),
    ...(fromFirestoreFields(document.fields || {}) as T),
  }));
};
