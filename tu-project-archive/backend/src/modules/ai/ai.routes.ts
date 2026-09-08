import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/auth.js';
import { searchLimiter } from '../../middleware/rateLimit.js';
import { geminiConfigured } from '../../config/env.js';
import {
  semanticSearch,
  relatedProjects,
  chatAnswer,
  indexProject,
  indexAllProjects,
} from './ai.service.js';

/**
 * AI endpoints (Google Gemini). All are safe to call with no API key: they
 * return `{ enabled: false }` or a clear message instead of failing, so the
 * frontend can hide/disable AI UI gracefully.
 */
export const aiRouter = Router();

// GET /api/ai/config — lets the UI show/hide AI features.
aiRouter.get('/config', (_req, res) => {
  res.json(ok({ enabled: geminiConfigured }));
});

// GET /api/ai/search?q=... — semantic (meaning-based) search, public.
aiRouter.get(
  '/search',
  searchLimiter,
  optionalAuth,
  validate({ query: z.object({ q: z.string().min(1).max(300), limit: z.coerce.number().int().min(1).max(50).default(20) }) }),
  asyncHandler(async (req, res) => {
    const { q, limit } = req.query as unknown as { q: string; limit: number };
    const results = await semanticSearch(q, limit);
    res.json(ok({ enabled: geminiConfigured && results !== null, query: q, results: results ?? [] }));
  }),
);

// GET /api/ai/related/:projectId — semantically related projects, public.
aiRouter.get(
  '/related/:projectId',
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const results = await relatedProjects(projectId, 5);
    res.json(ok({ enabled: geminiConfigured && results !== null, results: results ?? [] }));
  }),
);

// POST /api/ai/chat — grounded assistant, public but throttled.
aiRouter.post(
  '/chat',
  searchLimiter,
  optionalAuth,
  validate({ body: z.object({ question: z.string().min(1).max(500) }) }),
  asyncHandler(async (req, res) => {
    const { question } = req.body as { question: string };
    const answer = await chatAnswer(question);
    if (!answer) {
      res.json(ok({ enabled: false, answer: 'The AI assistant is not configured yet.', sources: [] }));
      return;
    }
    res.json(ok({ enabled: true, ...answer }));
  }),
);

// POST /api/ai/index/:projectId — (admin) (re)build one project's embedding+summary.
aiRouter.post(
  '/index/:projectId',
  requireAuth,
  requireAdmin,
  validate({ params: z.object({ projectId: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const { projectId } = params<{ projectId: string }>(req);
    const changed = await indexProject(projectId);
    res.json(ok({ enabled: geminiConfigured, changed }));
  }),
);

// POST /api/ai/index-all — (admin) backfill embeddings/summaries for the archive.
aiRouter.post(
  '/index-all',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const count = await indexAllProjects();
    res.json(ok({ enabled: geminiConfigured, indexed: count }));
  }),
);
