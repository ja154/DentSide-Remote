# DentSide Remote - Strategic Phasing & Milestones

## 🟢 PHASE 1 — “Income Fast” MVP (0–3 months)
**Focus:** Freelance + Non-Clinical Work (Writing, Tutoring, Consulting, Non-insurance Case reviews)
**Why:** No licensing barriers, global reach (perfect for Kenya), fast liquidity.
- [x] Design Landing Page & Dashboard UI
- [x] Setup Full Stack Architecture (Express + Vite)
- [x] Add backend route scaffolding for auth profiles, gigs, verification, appointments, withdrawals, admin audit, health checks, and Stripe webhook intake
- [ ] Implement Dentist profiles (verified)
- [ ] Build Gig marketplace (Freelance focus)
- [ ] Integrate Payments (M-Pesa, Stripe)
- [ ] Implement Simple matching (rule-based + basic AI)
- [x] Harden AI match API (request validation, body limits, request IDs, sanitized error responses)

### Current Backend Status
- Firebase-authenticated Express routes now exist for the main platform domains, but they still depend on valid Firebase project configuration in `.env`.
- Stripe and M-Pesa flows are scaffolded at the API boundary, with provider configuration still needed before live payouts can be processed.
- Verification intake now has a backend home, but file storage remains metadata-only until a production bucket workflow is enabled.
- An admin command-center UI now exists for operations review and verification moderation.

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
