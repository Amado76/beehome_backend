/**
 * Express application factory and router configuration.
 * Assembles all modules, middleware, and routes into a single Express app.
 */

import express from 'express';

import { errorMiddleware } from './core/errors/errorMiddleware';
import { buildAuthRouter } from './modules/auth/auth.routes';
import { buildDocsRouter } from './modules/docs/docs.routes';
import { buildFamiliesRouter } from './modules/families/families.routes';

/**
 * Create and configure Express application.
 *
 * @returns Express app with all routes and middleware configured
 */
export function createApp(): express.Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Mount routers for each module
  app.use('/auth', buildAuthRouter()); // Authentication: signup, login
  app.use('/families', buildFamiliesRouter()); // Family management: create family, add members
  app.use('/docs', buildDocsRouter()); // OpenAPI documentation (Swagger UI)

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  return app;
}
