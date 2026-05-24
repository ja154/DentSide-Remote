# DB Schema

This document describes the current DentSide Remote application data model as it exists in Supabase Postgres and Supabase Storage.

## Storage Model

- Primary database: Supabase Postgres
- File storage: Supabase Storage
- Timestamp format exposed by the app: ISO 8601 strings
- App-level database access pattern: frontend -> Express API for app CRUD, plus direct Supabase Auth / Storage / targeted Realtime from the browser

## Collection Map

### `users/{uid}`

Purpose:
Account profile and role record for each authenticated user.

Fields:
- `uid: string`
- `email?: string`
- `phoneNumber?: string`
- `role: 'dentist' | 'client' | 'admin'`
- `createdAt: string`
- `onboardingComplete: boolean`
- `displayName?: string`
- `photoURL?: string`
- `authMethod?: 'google' | 'email' | 'phone'`
- `experience?: string`
- `licenses?: string[]`
- `availability?: string`
- `interests?: string[]`
- `verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected'`
- `updatedAt?: string`

Notes:
- Document id is the same as `uid`.
- `authMethod` records whether the profile was initialized from Google auth, email/password auth, or phone OTP.
- `email` is optional because phone-only accounts are supported.
- `updatedAt` is optional for older documents, but current profile creation and update paths now write it.

### `gigs/{gigId}`

Purpose:
Marketplace listings created by clients or admins.

Fields:
- `title: string`
- `company: string`
- `type: string`
- `rateLabel: string`
- `description?: string`
- `tags: string[]`
- `remoteOnly: boolean`
- `status: 'draft' | 'open' | 'closed'`
- `createdBy: string`
- `createdByRole: 'dentist' | 'client' | 'admin'`
- `createdAt: string`
- `updatedAt: string`

Notes:
- `createdBy` stores a `users/{uid}` reference as a string.
- Document id is generated server-side.
- Soft delete is implemented by setting `status = 'closed'`.

### `verifications/{userId}`

Purpose:
Credential review record for dentists.

Fields:
- `userId: string`
- `legalName: string`
- `email: string`
- `clinic: string`
- `issuingState: string`
- `licenseNumber: string`
- `documentName: string`
- `documentPath?: string`
- `documentContentType?: string`
- `documentSizeBytes?: number`
- `status: 'pending' | 'approved' | 'rejected' | 'unverified'`
- `storageMode: 'bucket' | 'metadata_only'`
- `reviewNote?: string`
- `submittedAt: string`
- `updatedAt: string`

Notes:
- Document id is the same as `userId`.
- `documentPath` points into Supabase Storage when bucket-backed uploads are enabled.

### `bookings/{bookingId}`

Purpose:
Client consult requests and their lifecycle.

Fields:
- `clientId: string`
- `clientName: string`
- `dentistId?: string`
- `dentistName?: string`
- `reason: string`
- `scheduledFor?: string`
- `status: 'requested' | 'confirmed' | 'completed' | 'cancelled'`
- `createdAt: string`
- `updatedAt: string`

Notes:
- `clientId` and `dentistId` store user ids as strings.
- Document id is generated server-side.

### `withdrawals/{withdrawalId}`

Purpose:
Payout requests and provider processing status.

Fields:
- `userId: string`
- `email?: string`
- `phoneNumber?: string`
- `amount: number`
- `currency: string`
- `provider: 'stripe' | 'mpesa'`
- `destinationLabel: string`
- `destinationAccount?: string`
- `status: 'pending_provider_setup' | 'queued' | 'paid' | 'failed'`
- `providerRequestId?: string`
- `providerStatus?: string`
- `providerTransactionId?: string`
- `providerUpdatedAt?: string`
- `providerMetadata?: Record<string, unknown> | null`
- `statusReason?: string`
- `createdAt: string`
- `updatedAt: string`

Notes:
- `userId` stores a user id as a string.
- Document id is generated server-side.
- M-Pesa withdrawals store the normalized destination number in `destinationAccount`.
- Provider callback/idempotency metadata is persisted directly on the withdrawal record.

### `notifications/{notificationId}`

Purpose:
User-facing activity feed and unread tracking.

Fields:
- `userId: string`
- `type: 'verification_approved' | 'verification_rejected' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_completed' | 'new_appointment_request' | 'gig_posted' | 'withdrawal_paid' | 'withdrawal_failed' | 'system'`
- `title: string`
- `body: string`
- `read: boolean`
- `relatedId?: string`
- `createdAt: string`
- `updatedAt: string`

Notes:
- `relatedId` is a generic foreign key and may reference a gig, booking, verification, or withdrawal id.
- Document id is generated server-side.

## Supabase Storage Layout

### `verification-documents/{userId}/{filename}`

Purpose:
Stores uploaded verification files for dentists.

Stored outside Postgres:
- binary file contents

Mirrored into verification metadata:
- `documentName`
- `documentPath`
- `documentContentType`
- `documentSizeBytes`

## Derived Models

These are API response models and should not be modeled as their own first-class tables:

### Wallet summary

Derived from:
- `withdrawals/*`
- payout provider configuration in environment variables

### Dentist directory

Derived from:
- `users/*`

Filtering logic:
- `role == 'dentist'`
- `verificationStatus == 'approved'` for non-admin viewers

## DB Ops Plan

The intended database operations pattern is:

1. Frontend calls the Express API for app data.
2. Express validates the Supabase bearer token.
3. Route handlers validate payloads with Zod.
4. Route handlers apply business rules and authorization checks.
5. Supabase PostgREST reads and writes go through the shared wrapper in [server/services/data-provider.ts](/home/jay/Desktop/DentSide-Remote/server/services/data-provider.ts).
6. Supabase RLS provides a second line of enforcement for the realtime-enabled tables.

Exception:
- Verification files are uploaded directly from the authenticated frontend to Supabase Storage, then the file metadata is submitted to `/api/verify`.
- The browser subscribes directly to Supabase Realtime for `notifications` and `bookings`, while the Express API stays authoritative for business logic.

## ID Strategy

- `users/{uid}`: doc id equals auth uid
- `verifications/{userId}`: doc id equals user uid
- `gigs/{gigId}`: generated server-side
- `bookings/{bookingId}`: generated server-side
- `withdrawals/{withdrawalId}`: generated server-side
- `notifications/{notificationId}`: generated server-side

The API often returns an `id` field even when that `id` is not duplicated elsewhere in the row payload.

## Known Caveats

- Realtime is intentionally limited to `notifications` and `bookings`; other tables continue to flow through Express request/response cycles.
- M-Pesa payout delivery still depends on valid Daraja credentials and a publicly reachable `APP_URL` for callbacks.
- The schema file [schema.graphql](/home/jay/Desktop/DentSide-Remote/schema.graphql) is the canonical typed summary of this model.
