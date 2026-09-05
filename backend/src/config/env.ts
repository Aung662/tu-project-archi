import 'dotenv/config';
import { z } from 'zod';

/**
 * Central, validated configuration. The app refuses to boot with invalid env,
 * which prevents whole classes of production misconfiguration bugs.
 */
const boolish = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? def : v.toLowerCase() === 'true'));

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),

  DB_PROVIDER: z.enum(['sqlite', 'postgresql']).default('sqlite'),
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be >= 32 chars (use a long random value)'),
  JWT_EXPIRES_IN: z.string().default('6h'),
  COOKIE_NAME: z.string().default('tu_token'),
  COOKIE_SECURE: boolish(false),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@tu-archive.mm'),
  // No production default on purpose (see boot guard below): a known default
  // admin password is a full-takeover risk. Dev keeps a convenience default.
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe_Admin#2026'),
  SEED_ADMIN_NAME: z.string().default('Platform Admin'),

  SIMILARITY_EXACT_THRESHOLD: z.coerce.number().min(0).max(1).default(0.85),
  SIMILARITY_SIMILAR_THRESHOLD: z.coerce.number().min(0).max(1).default(0.3),

  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(26_214_400),
  UPLOAD_ALLOWED_EXT: z.string().default('pdf,doc,docx,zip,jpg,jpeg,png'),
  PRIVATE_STORAGE_DIR: z.string().default('./storage/private'),
  PUBLIC_STORAGE_DIR: z.string().default('./storage/public'),

  DEFAULT_PROJECT_PRICE_MMK: z.coerce.number().int().nonnegative().default(5000),
  PAYMENT_INSTRUCTIONS: z
    .string()
    .default('Transfer via KBZPay/Wave and upload the screenshot + transaction id.'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  UPLOAD_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  SEARCH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// ── Production-only security guards ───────────────────────────────────────────
// These run once at boot. In production we FAIL FAST on insecure configuration
// rather than silently shipping a vulnerable service.
if (env.NODE_ENV === 'production') {
  // 1) Cookies MUST be Secure (HTTPS-only). If unset, force on; if explicitly
  //    set to false, refuse to boot — an insecure session cookie in prod is
  //    never acceptable.
  if (process.env.COOKIE_SECURE === undefined) {
    env.COOKIE_SECURE = true;
  } else if (!env.COOKIE_SECURE) {
    // eslint-disable-next-line no-console
    console.error('❌ COOKIE_SECURE=false is not allowed in production (HTTPS-only cookies required).');
    process.exit(1);
  }

  // 2) The seed admin password must be explicitly provided in production — a
  //    known default (or the dev default) would allow instant account takeover.
  const seedPw = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPw || seedPw === 'ChangeMe_Admin#2026') {
    // eslint-disable-next-line no-console
    console.error('❌ SEED_ADMIN_PASSWORD must be set to a strong, non-default value in production.');
    process.exit(1);
  }
}

export const allowedExtensions = env.UPLOAD_ALLOWED_EXT.split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const isProd = env.NODE_ENV === 'production';
