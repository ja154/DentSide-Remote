# DentSide Remote - Strategic Phasing & Milestones

## 🟢 PHASE 1 — “Income Fast” MVP (0–3 months)
**Focus:** Freelance + Non-Clinical Work (Writing, Tutoring, Consulting, Non-insurance Case reviews)
**Why:** No licensing barriers, global reach (perfect for Kenya), fast liquidity.
- [x] Design Landing Page & Dashboard UI
- [x] Setup Full Stack Architecture (Express + Vite)
- [x] Add backend route scaffolding for auth profiles, gigs, verification, appointments, withdrawals, admin audit, health checks, and Stripe webhook intake
- [x] Implement Dentist profiles (verified)
- [x] Build Gig marketplace (Freelance focus)
- [ ] Integrate Payments (M-Pesa, Stripe)
- [ ] Implement Simple matching (rule-based + basic AI)
- [x] Harden AI match API (request validation, body limits, request IDs, sanitized error responses)

### Current Backend Status
- The auth/data/storage layer is now aligned to Supabase across the frontend and backend.
- Express routes now assume Supabase-backed auth and data access, which keeps the Render hosting plan consistent across environments.
- Stripe and M-Pesa flows are scaffolded at the API boundary, with provider configuration still needed before live payouts can be processed.
- Verification intake now supports real Supabase Storage uploads when a bucket is configured, with metadata-only fallback only when storage is intentionally unavailable.
- An admin command-center UI now exists for operations review and verification moderation.
- Verified dentist search, consult requests, withdrawal requests, and admin role/payout actions are now connected to the live Express API from the frontend.
- The backend can now run in API-only production mode for Render, while separately hosted frontends can target it through `VITE_API_BASE_URL`.
- Client and admin users now have a shared gig studio for end-to-end marketplace CRUD on top of `/api/gigs`.
- Authentication now supports Supabase-backed Google and email/password sign-in, with profile setup driven from shared auth state whenever an authenticated user does not yet have a `users/{uid}` record.

## 🟡 PHASE 2 — Teledentistry Layer (3–6 months)
**Focus:** Second opinions, Treatment planning (No prescriptions initially to avoid legal risk).
- [ ] Add Video consult system (WebRTC)
- [ ] Build Patient marketplace
- [ ] Implement AI notes + radiograph upload
- [ ] Develop License-aware routing engine & Geo-restrictions

## 🔴 PHASE 3 — Enterprise Layer (6–12 months)
**Focus:** Insurance claims review, DSO partnerships, Corporate contracts.
- [ ] Build Insurance claims review portal
- [ ] Establish DSO partnerships integration
- [ ] Implement Corporate contracts management
- [ ] Advanced Trust Layer (Ratings, Case history, Credential scoring)
