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

export interface FirebaseIdentity {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  createdAt: string;
  onboardingComplete: boolean;
  experience?: string;
  licenses?: string[];
  availability?: string;
  interests?: string[];
  verificationStatus?: VerificationStatus;
}

export interface GigRecord {
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

export interface VerificationRecord {
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

export interface AppointmentRecord {
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

export interface NotificationRecord {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId?: string;
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

export type WithId<T> = T & { id: string };

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      firebaseToken?: string;
      firebaseUser?: FirebaseIdentity;
      profile?: UserProfile | null;
    }
  }
}

export {};
