import { Router } from 'express';
import { ok } from '../lib/http.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { projectsRouter } from '../modules/projects/projects.routes.js';
import { searchRouter } from '../modules/search/search.routes.js';
import { filesRouter } from '../modules/files/files.routes.js';
import { imagesRouter } from '../modules/images/images.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { bookmarksRouter } from '../modules/bookmarks/bookmarks.routes.js';
import { paymentsRouter } from '../modules/payments/payments.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { universitiesRouter } from '../modules/universities/universities.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json(
    ok({
      name: 'TU Project Archive & Title Similarity Checker API',
      version: '1.0.0',
      endpoints: ['/auth', '/projects', '/search', '/files', '/images', '/analytics', '/bookmarks', '/payments', '/admin', '/universities'],
    }),
  );
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/universities', universitiesRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/files', filesRouter);
apiRouter.use('/images', imagesRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/bookmarks', bookmarksRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/admin', adminRouter);
