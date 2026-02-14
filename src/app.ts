import express from 'express';

import { errorMiddleware } from './core/errors/errorMiddleware';
import { buildAuthRouter } from './modules/auth/auth.routes';
import { buildDocsRouter } from './modules/docs/docs.routes';

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/auth', buildAuthRouter());
  app.use('/docs', buildDocsRouter());

  app.use(errorMiddleware);

  return app;
}
