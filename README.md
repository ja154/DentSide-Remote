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
- `GET /api/dentists`, `GET /api/dentists/:dentistId`: verified dentist directory for clients and admins.
- `GET /api/gigs`, `GET /api/gigs/:gigId`, `POST /api/gigs`, `PATCH /api/gigs/:gigId`, `DELETE /api/gigs/:gigId`: backend structure for the gig marketplace collection.
- `POST /api/verify`, `GET /api/verify/status`: verification request intake with server-side validation.
- `GET /api/appointments`, `GET /api/appointments/:appointmentId`, `POST /api/appointments`, `PATCH /api/appointments/:appointmentId`: consult request structure with role-based state transitions.
- `GET /api/withdraw/summary`, `GET /api/withdraw/history`, `POST /api/withdraw`: wallet and payout request structure.
- `GET /api/notifications`, `PATCH /api/notifications/:notificationId`, `POST /api/notifications/read-all`: in-app notification feed with read tracking.
- `GET /api/admin/*`, `PATCH /api/admin/verifications/:userId`, `PATCH /api/admin/users/:userId/role`, `PATCH /api/admin/withdrawals/:withdrawalId`: admin audit and moderation routes.
- `POST /api/webhooks/stripe`: Stripe webhook signature verification scaffold.

## Admin Console
- Admin users now have a dedicated `/admin` command center for:
  - overview counts and integration readiness
  - user role management
  - verification moderation with approve/reject/pending actions
  - withdrawal queue decisions
  - reviews of gigs and appointments

## Frontend Integration Status
- Client network and appointment screens now use the live `/api/dentists` and `/api/appointments` routes for verified search, consult creation, and client-side cancellation.
- The dentist dashboard now shows live consult queue actions from `/api/appointments` and live wallet metrics from `/api/withdraw/summary`.
- The wallet screen can now submit withdrawal requests through `POST /api/withdraw`.
- A shared in-app notification menu now reads from `/api/notifications`, and appointment/admin actions emit notification records for affected users.
- The admin command center now includes user role changes and withdrawal queue actions in addition to the earlier verification moderation tools.

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
   - `VITE_FIREBASE_MEASUREMENT_ID` (optional)
5. Optional integrations:
   - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - M-Pesa: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`
6. `GEMINI_API_KEY` is optional because the app still supports BYOK in the dashboard UI.
7. Run `npm run dev` to start the development server.
8. Open `http://localhost:3000` in your browser.
9. If your frontend will run on a different origin than the backend, set `VITE_API_BASE_URL` in the frontend environment to the deployed API base URL.

## Deployment
The app is configured to be deployed as a full-stack application.
- Build: `npm run build`
- Start: `npm start` (runs the Express server serving the built static files)

### Render Backend Deployment
Use this mode when the React frontend is hosted separately and Render is only serving the Express API.

1. Create a Render Web Service from this repository, or use the included [render.yaml](/home/jay/Desktop/DentSide-Remote/render.yaml) blueprint.
2. Set the build command to `npm install`.
3. Set the start command to `npm run start:api`.
4. Set the health check path to `/health`.
5. Configure these backend environment variables in Render:
   - `NODE_ENV=production`
   - `SERVE_STATIC_FRONTEND=false`
   - `APP_URL=https://your-render-service.onrender.com`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.com`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_DATABASE_ID` if you do not use the default Firestore database
   - `VITE_FIREBASE_STORAGE_BUCKET` if verification storage is enabled
   - optional payout keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MPESA_*`
6. In the frontend deployment, set `VITE_API_BASE_URL=https://your-render-service.onrender.com` so `/api/...` calls target Render instead of the website origin.

When `SERVE_STATIC_FRONTEND=false`, the Render service behaves as an API-only backend and does not require a `dist` build.

## Security
- API keys provided via the BYOK interface are only used for the duration of the session and are not stored permanently.
- API payloads are validated with Zod on the server, including profile shape and BYOK key formatting.
- Request size limits, rate limiting, and a global error handler reduce abuse and prevent accidental data leakage through raw stack traces.
- Security headers are enforced with Helmet, including stricter referrer behavior.
- Firebase-protected routes now require bearer-token validation on the server before profile, verification, gigs, appointments, withdrawals, or admin actions run.
- Wallet, verification, gigs, and appointment structures now flow through Express routes instead of browser-side Firestore writes.
- Admin moderation now has a first-party UI instead of API-only routes.
- Split frontend/backend deployments are supported by `VITE_API_BASE_URL`, CORS allowlists, and an API-only server mode for hosts such as Render.
