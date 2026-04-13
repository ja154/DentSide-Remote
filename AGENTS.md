# AI Agent Instructions (AGENTS.md)

## Version: 1.0.0

## Core Directives
1. **Tech Stack**: Always use React 19, Vite, Tailwind CSS, and Framer Motion for frontend tasks. Use Express.js for backend tasks.
2. **Styling**: Strictly adhere to Tailwind CSS utility classes. Do not create custom CSS files unless absolutely necessary. Use the `Inter` font family.
3. **Icons**: Use `lucide-react` for all icons.
4. **Security**: 
   - Never hardcode API keys. 
   - Use the established BYOK (Bring Your Own Key) pattern for external APIs where applicable, or environment variables (`process.env` / `import.meta.env`).
   - Ensure all new API endpoints have proper error handling and validation.
5. **Architecture**: Maintain the full-stack architecture (Express + Vite). Do not revert to a client-only SPA setup.
6. **Documentation**: Keep `README.md`, `planning.md`, and `tasks.md` updated when significant architectural changes or milestones are reached.

## Hooks
- **Pre-commit**: Ensure `npm run lint` passes before finalizing any major feature.
- **Post-install**: If adding new backend dependencies, ensure they are compatible with the `node --experimental-strip-types server.ts` start script.
