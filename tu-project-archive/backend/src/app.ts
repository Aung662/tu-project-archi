import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, isProd } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { ok } from './lib/http.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  // Behind a reverse proxy (Render/Railway/Vercel) — needed for secure cookies + rate limit IPs.
  app.set('trust proxy', 1);

  // Gzip every text response (JSON API payloads, HTML errors). Images are stored
  // pre-compressed (JPEG/WebP) so gzip skips them automatically by content-type,
  // avoiding wasted CPU on already-compressed bytes.
  app.use(compression());

  // Helmet with an explicit, strict Content-Security-Policy. The API returns
  // JSON (and streams files), so it needs no scripts/styles of its own — lock it
  // all down to 'self' and forbid framing. This is defense-in-depth for the API;
  // the frontend sets its own CSP via vercel.json.
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (!isProd) app.use(morgan('dev'));

  // Liveness/readiness
  app.get('/health', (_req, res) => {
    res.json(ok({ status: 'ok', service: 'tu-archive-backend', time: new Date().toISOString() }));
  });

  app.use('/api', apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
