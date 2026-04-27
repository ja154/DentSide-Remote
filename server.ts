import { createApp } from './server/app.ts';
import { env } from './server/env.ts';

async function startServer() {
  const app = await createApp();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
