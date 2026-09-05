import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, params } from '../../lib/http.js';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { browseProjects, getProjectDetail } from './projects.service.js';

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

// GET /api/projects/:id — public detail (published only for non-admins)
projectsRouter.get(
  '/:id',
  optionalAuth,
  validate({ params: z.object({ id: z.string().min(1) }) }),
  asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'ADMIN';
    res.json(ok(await getProjectDetail(params(req).id, { isAdmin })));
  }),
);
