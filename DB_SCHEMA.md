# DB Schema

This document describes the current DentSide Remote application data model as it exists in Firestore and Firebase Storage.

## Storage Model

- Primary database: Cloud Firestore
- File storage: Firebase Storage
- Timestamp format in Firestore: ISO 8601 strings
- App-level database access pattern: frontend -> Express API -> Firestore REST wrapper

## Collection Map

### `users/{uid}`

Purpose:
Account profile and role record for each authenticated user.

Fields:
- `uid: string`
- `email: string`
- `role: 'dentist' | 'client' | 'admin'`
- `createdAt: string`
- `onboardingComplete: boolean`
- `displayName?: string`
- `photoURL?: string`
- `authMethod?: 'google' | 'email'`
- `experience?: string`
- `licenses?: string[]`
- `availability?: string`
- `interests?: string[]`
- `verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected'`
- `updatedAt?: string`

Notes:
- Document id is the same as `uid`.
- `authMethod` records whether the profile was initialized from Google auth or email/password auth.
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
- `documentPath` points into Firebase Storage when bucket-backed uploads are enabled.

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
- `email: string`
- `amount: number`
- `currency: string`
- `provider: 'stripe' | 'mpesa'`
- `destinationLabel: string`
- `status: 'pending_provider_setup' | 'queued' | 'paid' | 'failed'`
- `createdAt: string`
- `updatedAt: string`

Notes:
- `userId` stores a user id as a string.
- Document id is generated server-side.

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

## Firebase Storage Layout

### `verification-documents/{userId}/{filename}`

Purpose:
Stores uploaded verification files for dentists.

Stored outside Firestore:
- binary file contents

Mirrored into Firestore verification metadata:
- `documentName`
- `documentPath`
- `documentContentType`
- `documentSizeBytes`

## Derived Models

These are API response models and should not be modeled as their own Firestore collections:

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
2. Express validates the Firebase bearer token.
3. Route handlers validate payloads with Zod.
4. Route handlers apply business rules and authorization checks.
5. Firestore reads and writes go through the shared REST wrapper in `server/services/firebase-rest.ts`.
6. Firestore Security Rules provide a second line of enforcement.

Exception:
- Verification files are uploaded directly from the authenticated frontend to Firebase Storage, then the file metadata is submitted to `/api/verify`.

## ID Strategy

- `users/{uid}`: doc id equals auth uid
- `verifications/{userId}`: doc id equals user uid
- `gigs/{gigId}`: generated server-side
- `bookings/{bookingId}`: generated server-side
- `withdrawals/{withdrawalId}`: generated server-side
- `notifications/{notificationId}`: generated server-side

The API often returns an `id` field even when that `id` is not stored inside the Firestore document body.

## Known Caveats

- Firestore rules currently define `users`, `gigs`, `verifications`, `bookings`, and `withdrawals`.
- The codebase also uses a `notifications` collection, so notification rules should be added or verified before relying on that collection in production.
- The schema file [schema.graphql](/home/jay/Desktop/DentSide-Remote/schema.graphql) is the canonical typed summary of this model.
