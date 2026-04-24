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

## Setup & Running Locally
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file based on `.env.example` and add your `GEMINI_API_KEY` (optional, as the app supports BYOK in the UI).
4. Run `npm run dev` to start the development server.
5. Open `http://localhost:3000` in your browser.

## Deployment
The app is configured to be deployed as a full-stack application.
- Build: `npm run build`
- Start: `npm start` (runs the Express server serving the built static files)

## Security
- API keys provided via the BYOK interface are only used for the duration of the session and are not stored permanently.
- API payloads are validated with Zod on the server, including profile shape and BYOK key formatting.
- Request size limits, rate limiting, and a global error handler reduce abuse and prevent accidental data leakage through raw stack traces.
- Security headers are enforced with Helmet, including stricter referrer behavior.
