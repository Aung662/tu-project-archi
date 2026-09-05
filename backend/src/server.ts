import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 TU Archive API listening on http://0.0.0.0:${env.PORT} [${env.NODE_ENV}]`);
});

const shutdown = (sig: string) => {
  // eslint-disable-next-line no-console
  console.log(`\n${sig} received, shutting down...`);
  server.close(() => process.exit(0));
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
