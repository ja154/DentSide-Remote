# Pending Tasks (Phase 1 Focus)

- [x] **Dentist Profiles**: Add phone-capable profile fields and preserve server-side profile creation on top of `/api/auth/profile`.
- [x] **Gig Marketplace CRUD**: Add a shared client/admin gig studio on top of `/api/gigs` for create, edit, search, and soft-delete flows.
- [~] **Payments Integration**: M-Pesa payout initiation and callbacks now run through Express; Stripe Connect still remains to be fully wired.
- [ ] **Simple Matching Engine**: Refine the AI Matchmaker to connect dentists to gigs based on their profile data.
- [x] **Client Consult Flow**: Wire `/api/dentists` and `/api/appointments` into the client UI with live dentist search, consult creation, and cancellation.
- [x] **Wallet Requests**: Connect the wallet screen to `POST /api/withdraw` for real withdrawal submission.
- [x] **Operational Actions**: Extend the admin UI with `/api/admin/users` role changes and `/api/admin/withdrawals` queue decisions.
- [x] **Notifications UI**: Add a shared notification center backed by `/api/notifications`, with appointment/admin actions emitting records and Supabase Realtime keeping the menu fresh.
- [x] **Auth Onboarding**: Support phone OTP plus Google and email/password authentication, and route authenticated users without profiles back through role-based profile setup.
- [x] **Deployment Readiness**: Support API-only Render hosting with frontend API base URL configuration and production CORS/static-serving controls.
- [x] **Supabase Readiness**: Align auth, data, storage, targeted realtime, and deployment config around Supabase so the app matches the current hosting plan.
- [ ] **Escrow System**: Design a basic escrow flow to hold funds until a gig is completed to build trust.

- [ ] **Security Hardening**: Add production observability, alerting, and stronger token/session diagnostics beyond the new request IDs, Zod validation, and protected Supabase-backed routes.
- [x] **Storage Workflow**: Replace verification metadata-only uploads with a real Supabase Storage upload pipeline and persist storage metadata through `/api/verify`.
- [x] **Admin Experience**: Build an admin UI on top of `/api/admin/overview`, `/api/admin/verifications`, `/api/admin/gigs`, `/api/admin/appointments`, and `/api/admin/withdrawals`.
