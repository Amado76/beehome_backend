/**
 * OpenAPI registration for families endpoints.
 * This file is imported in registerAll.ts to register all family schemas and paths
 * into the global OpenAPI registry. The registry is later used to generate
 * the full OpenAPI specification served at /docs.
 */

import { registry } from '../../core/openapi/openapi';
import { errorResponseSchema } from '../../core/openapi/commonSchemas';

import { createFamilyRequestSchema, familySchema } from './families.schemas';

/**
 * Register POST /families endpoint in OpenAPI spec.
 * - Requires Bearer token authentication
 * - Accepts optional family name in request body
 * - Returns 201 Created with family ID on success
 * - Returns 400/401/402 for validation/auth/license errors
 */
registry.registerPath({
  method: 'post',
  path: '/families',
  tags: ['Families'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: false,
      content: {
        'application/json': {
          schema: createFamilyRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': {
          schema: familySchema,
        },
      },
    },
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
