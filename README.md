# DentSide Remote

DentSide Remote is a unified, dentist-only digital platform (web + mobile app) that acts as your personal remote career hub. Instead of jumping between multiple platforms, you sign up once, verify your license(s), set your availability, and get instant access to all income streams in a single dashboard.

## Product Architecture
1. **Identity Layer**: Dentist verification, License engine, Skill tagging
2. **Opportunity Engine**: Gigs, Consults, Jobs
3. **Matching AI**: Availability, Timezone, Skill-value optimization
4. **Payments Layer**: Multi-currency payouts (Stripe, M-Pesa), Escrow system
5. **Trust Layer**: Ratings, Case history, Credential scoring

## Business Model
1. **SaaS Subscription**: Free tier, Pro tier ($19/month)
2. **Take Rate**: 10–20% per gig/consult
3. **Enterprise Contracts**: Insurance companies, DSOs (Highest margin)
4. **Upsells**: Profile boosting, AI tools (notes, CV optimizer), Insurance partnerships

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, React Router
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini API (@google/genai)

## Backend Surface
- `GET /health`: health check with Firebase, storage, Stripe, and M-Pesa configuration flags.
- `POST /api/auth/profile`, `GET /api/auth/profile`, `PATCH /api/auth/profile`: server-side profile creation and updates behind Firebase bearer-token validation.
- `GET /api/gigs`, `POST /api/gigs`: backend structure for the gig marketplace collection.
- `POST /api/verify`, `GET /api/verify/status`: verification request intake with server-side validation.
- `GET /api/appointments`, `POST /api/appointments`: appointment and consult request structure for the client portal.
- `GET /api/withdraw/summary`, `GET /api/withdraw/history`, `POST /api/withdraw`: wallet and payout request structure.
- `GET /api/admin/*`, `PATCH /api/admin/verifications/:userId`: admin audit and moderation routes.
- `POST /api/webhooks/stripe`: Stripe webhook signature verification scaffold.

## Setup & Running Locally
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file based on `.env.example`.
4. Add Firebase web config values so the backend can validate ID tokens and access Firestore through the authenticated user context:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
5. Optional integrations:
   - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - M-Pesa: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`
6. `GEMINI_API_KEY` is optional because the app still supports BYOK in the dashboard UI.
7. Run `npm run dev` to start the development server.
8. Open `http://localhost:3000` in your browser.

## Deployment
The app is configured to be deployed as a full-stack application.
- Build: `npm run build`
- Start: `npm start` (runs the Express server serving the built static files)

## Security
- API keys provided via the BYOK interface are only used for the duration of the session and are not stored permanently.
- API payloads are validated with Zod on the server, including profile shape and BYOK key formatting.
- Request size limits, rate limiting, and a global error handler reduce abuse and prevent accidental data leakage through raw stack traces.
- Security headers are enforced with Helmet, including stricter referrer behavior.
- Firebase-protected routes now require bearer-token validation on the server before profile, verification, gigs, appointments, withdrawals, or admin actions run.
- Wallet, verification, gigs, and appointment structures now flow through Express routes instead of browser-side Firestore writes.
