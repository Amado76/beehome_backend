import type { RequestHandler } from 'express';

import { asyncHandler } from '../../core/http/asyncHandler';
import { AppError } from '../../core/errors/AppError';
import type { FamiliesService } from './families.service';

/**
 * Factory function to create a FamiliesController instance.
 * Handles HTTP request/response translation for family operations.
 *
 * @param service - FamiliesService instance for business logic
 * @returns Object with HTTP request handlers
 */
export function buildFamiliesController(service: FamiliesService): {
  createFamily: RequestHandler;
} {
  return {
    /**
     * POST /families handler.
     * Validates authentication, extracts optional name from request body,
     * delegates to service for creation, and returns 201 Created response.
     *
     * @throws Will throw AppError(UNAUTHORIZED) if no authenticated user
     * @throws Service may throw AppError for business logic violations
     */
    createFamily: asyncHandler(async (req, res) => {
      // Extract authenticated user ID from request context
      const userId = req.ctx?.auth?.userId;
      if (!userId) {
        throw new AppError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          statusCode: 401,
        });
      }

      // Parse request body and conditionally include name to avoid undefined
      const body = (req.body ?? {}) as { name?: string };
      const result = await service.createFamily(
        body.name
          ? { ownerUserId: userId, name: body.name }
          : { ownerUserId: userId },
      );

      // Return 201 Created with family ID and optional name
      res.status(201).json(result);
    }),
  };
}
