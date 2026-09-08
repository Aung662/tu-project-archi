import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import {
  browseProjects,
  getProjectDetail,
  getSimilarProjects,
  autocompleteTitles,
  recordProjectView,
  getTrendingProjects,
} from './projects.service.js';

export const projectsRouter = Router();

const browseQuery = z.object({
  year: z.coerce.number().int().optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  universityId: z.string().optional(),
  departmentId: z.string().optional(),
  level: z.enum(['YEAR_3', 'YEAR_5', 'FINAL_YEAR', 'OTHER']).optional(),
  q: z.string().max(200).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  freeOnly: z.coerce.boolean().optional(),
  hasFile: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'priceLow', 'priceHigh', 'title']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

// GET /api/projects — public browse with facets + pagination
projectsRouter.get(
  '/',
  validate({ query: browseQuery }),
  asyncHandler(async (req, res) => {
    const params = req.query as unknown as z.infer<typeof browseQuery>;
    res.json(ok(await browseProjects(params)));
  }),
);

// GET /api/projects/autocomplete?q= — title suggestions for the search box
projectsRouter.get(
  '/autocomplete',
  validate({ query: z.object({ q: z.string().max(200).optional() }) }),
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string) ?? '';
    res.json(ok(await autocompleteTitles(q)));
  }),
);

// GET /api/projects/trending — most-viewed published projects
projectsRouter.get(
  '/trending',
  validate({ query: z.object({ limit: z.coerce.number().int().min(1).max(12).optional() }) }),
  asyncHandler(async (req, res) => {
    const limit = (req.query.limit as unknown as number) ?? 6;
    res.json(ok(await getTrendingProjects(limit)));
  }),
);

// GET /api/projects/:id — public detail (published only for non-admins)
projectsRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'ADMIN';
    const detail = await getProjectDetail(params(req).id, { isAdmin });
    // Count the view (best-effort, deduped) only for the public published view.
    if (!isAdmin) recordProjectView(params(req).id, req.ip);
    res.json(ok(detail));
  }),
);

// GET /api/projects/:id/similar — related "you might also like" projects
projectsRouter.get(
  '/:id/similar',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    res.json(ok(await getSimilarProjects(params(req).id)));
  }),
);
