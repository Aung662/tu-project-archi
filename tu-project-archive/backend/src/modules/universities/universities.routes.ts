import { Router } from 'express';
import { asyncHandler, ok } from '../../lib/http.js';
import { prisma } from '../../lib/prisma.js';

export const universitiesRouter = Router();

// GET /api/universities — public list (with departments) for browse facets
universitiesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const universities = await prisma.university.findMany({
      orderBy: { shortName: 'asc' },
      include: { departments: { orderBy: { code: 'asc' } } },
    });
    res.json(ok(universities));
  }),
);

// GET /api/universities/facets — distinct years + levels present in published data
universitiesRouter.get(
  '/facets',
  asyncHandler(async (_req, res) => {
    const years = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      distinct: ['year'],
      select: { year: true },
      orderBy: { year: 'desc' },
    });
    res.json(
      ok({
        years: years.map((y) => y.year),
        levels: ['YEAR_3', 'YEAR_5', 'FINAL_YEAR', 'OTHER'],
      }),
    );
  }),
);
