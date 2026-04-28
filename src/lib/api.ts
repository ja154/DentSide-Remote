import { auth } from './firebase';

export type Role = 'dentist' | 'client' | 'admin';
export type VerificationStatus = 'unverified' | 'pending' | 'approved' | 'rejected';
export type GigStatus = 'draft' | 'open' | 'closed';
export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled';
export type WithdrawalProvider = 'stripe' | 'mpesa';
export type WithdrawalStatus = 'pending_provider_setup' | 'queued' | 'paid' | 'failed';
export type NotificationType =
  | 'verification_approved'
  | 'verification_rejected'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_completed'
  | 'new_appointment_request'
  | 'gig_posted'
  | 'withdrawal_paid'
  | 'withdrawal_failed'
  | 'system';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  createdAt: string;
  onboardingComplete?: boolean;
  experience?: string;
  licenses?: string[];
  availability?: string;
  interests?: string[];
  verificationStatus?: VerificationStatus;
}

export interface VerificationRecord {
  id: string;
  userId: string;
  legalName: string;
  email: string;
  clinic: string;
  issuingState: string;
  licenseNumber: string;
  documentName: string;
  status: VerificationStatus;
  storageMode: 'bucket' | 'metadata_only';
  reviewNote?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface PublicDentistProfile {
  id: string;
  uid: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  experience?: string;
  interests?: string[];
  availability?: string;
  verificationStatus?: VerificationStatus;
  onboardingComplete?: boolean;
}

export interface Gig {
  id: string;
  title: string;
  company: string;
  type: string;
  rateLabel: string;
  description?: string;
  tags: string[];
  remoteOnly: boolean;
  status: GigStatus;
  createdBy: string;
  createdByRole: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  dentistId?: string;
  dentistName?: string;
  reason: string;
  scheduledFor?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  email: string;
  amount: number;
  currency: string;
  provider: WithdrawalProvider;
  destinationLabel: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletSummary {
  availableBalance: number;
  pendingBalance: number;
  lifetimeWithdrawn: number;
  defaultCurrency: string;
  payoutsConfigured: {
    stripe: boolean;
    mpesa: boolean;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFeed {
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface AdminOverview {
  counts: {
    users: number;
    gigs: number;
    verifications: number;
    bookings: number;
    withdrawals: number;
  };
  integrations: {
    firebase: boolean;
    storage: boolean;
    stripe: boolean;
    mpesa: boolean;
  };
}

export interface AdminUser extends UserProfile {
  id: string;
  updatedAt?: string;
}

export interface VerificationStatusResponse {
  verification: VerificationRecord | null;
  storageConfigured: boolean;
}

export function getDashboardPathForRole(role: Role) {
  if (role === 'admin') {
    return '/admin';
  }

  return role === 'dentist' ? '/dashboard' : '/client-dashboard';
}

type ApiErrorPayload = {
  error?: string;
  code?: string;
  requestId?: string;
  issues?: unknown;
};

export class ApiError extends Error {
  public readonly code?: string;
  public readonly requestId?: string;
  public readonly status: number;
  public readonly issues?: unknown;

  public constructor(message: string, status: number, details?: ApiErrorPayload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = details?.code;
    this.requestId = details?.requestId;
    this.issues = details?.issues;
  }
}

const getAuthToken = async () => {
  if (!auth?.currentUser) {
    return null;
  }

  return auth.currentUser.getIdToken();
};

export async function apiRequest<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = await getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const details = typeof payload === 'object' && payload ? (payload as ApiErrorPayload) : undefined;
    throw new ApiError(details?.error || `Request failed with status ${response.status}.`, response.status, details);
  }

  return payload as T;
}

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
