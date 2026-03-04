import type { Router } from 'express';
import { Router as createRouter } from 'express';

import { requireAuth } from '../../core/auth/requireAuth';
import { validate } from '../../core/validation/validate';
import { buildFamiliesController } from './families.controller';
import { createFamilyRequestSchema } from './families.schemas';
import { createFamiliesService } from './families.service';

/**
 * Factory function to create the families router.
 * Wires together middleware, validation, controller, and service for all family-related endpoints.
 *
 * Endpoints:
 * - POST /families - Create a new family (requires auth)
 *
 * @returns Express Router instance ready to be mounted in app
 */
export function buildFamiliesRouter(): Router {
  const router = createRouter();
  const service = createFamiliesService();
  const controller = buildFamiliesController(service);

  /**
   * POST / - Create a new family
   * Middleware chain (in order):
   * 1. requireAuth - Validates JWT token and extracts user ID
   * 2. validate({ body: createFamilyRequestSchema }) - Validates request body against schema
   * 3. controller.createFamily - Handles the actual creation logic
   */
  router.post(
    '/',
    requireAuth,
    validate({ body: createFamilyRequestSchema }),
    controller.createFamily,
  );

  return router;
}
