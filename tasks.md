# Pending Tasks (Phase 1 Focus)

- [ ] **Dentist Profiles**: Finish production Firebase configuration and complete verified-profile moderation flows on top of the new `/api/auth/profile` and `/api/verify` routes.
- [ ] **Gig Marketplace**: Expand the new `/api/gigs` backend structure into full CRUD, search filters, and approval workflows.
- [ ] **Payments Integration**: Connect live Stripe Connect and M-Pesa provider calls behind the new `/api/withdraw` and `/api/webhooks/stripe` server scaffolding.
- [ ] **Simple Matching Engine**: Refine the AI Matchmaker to connect dentists to gigs based on their profile data.
- [x] **Client Consult Flow**: Wire `/api/dentists` and `/api/appointments` into the client UI with live dentist search, consult creation, and cancellation.
- [x] **Wallet Requests**: Connect the wallet screen to `POST /api/withdraw` for real withdrawal submission.
- [x] **Operational Actions**: Extend the admin UI with `/api/admin/users` role changes and `/api/admin/withdrawals` queue decisions.
- [x] **Notifications UI**: Add a shared notification center backed by `/api/notifications`, with appointment and admin actions emitting notification records.
- [ ] **Escrow System**: Design a basic escrow flow to hold funds until a gig is completed to build trust.

- [ ] **Security Hardening**: Add production observability, alerting, and stronger token/session diagnostics beyond the new request IDs, Zod validation, and protected Firebase-backed routes.
- [ ] **Storage Workflow**: Replace verification metadata-only uploads with a real Firebase Storage or signed-upload pipeline.
- [x] **Admin Experience**: Build an admin UI on top of `/api/admin/overview`, `/api/admin/verifications`, `/api/admin/gigs`, `/api/admin/appointments`, and `/api/admin/withdrawals`.
