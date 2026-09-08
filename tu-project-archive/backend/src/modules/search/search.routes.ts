import { Router, type Request } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { searchLimiter } from '../../middleware/rateLimit.js';
import { searchSimilar, checkDuplicate, type SearchContext } from './search.service.js';

export const searchRouter = Router();

/** Build best-effort analytics context from the request. */
function ctxOf(req: Request): SearchContext {
  return { actorId: req.user?.sub, ip: req.ip };
}

// Throttle + capture (optional) identity for every search endpoint.
searchRouter.use(searchLimiter, optionalAuth);

const searchQuery = z.object({
  q: z.string().min(1, 'query is required').max(300),
  year: z.coerce.number().int().optional(),
  universityId: z.string().optional(),
  departmentId: z.string().optional(),
  level: z.enum(['YEAR_3', 'YEAR_5', 'FINAL_YEAR', 'OTHER']).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// GET /api/search?q=...  — public, no login required
searchRouter.get(
  '/',
  validate({ query: searchQuery }),
  asyncHandler(async (req, res) => {
    const { q, limit, ...filters } = req.query as unknown as z.infer<typeof searchQuery>;
    const result = await searchSimilar(q, filters, limit, { ctx: ctxOf(req) });
    res.json(ok(result));
  }),
);

// GET /api/search/check?title=... — duplicate-risk verdict for a proposed title
searchRouter.get(
  '/check',
  validate({ query: z.object({ title: z.string().min(1).max(300) }) }),
  asyncHandler(async (req, res) => {
    const { title } = req.query as { title: string };
    res.json(ok(await checkDuplicate(title, ctxOf(req))));
  }),
);
