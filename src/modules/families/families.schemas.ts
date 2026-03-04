import { z } from '../../core/openapi/zod';

/**
 * Request schema for creating a new family.
 * Validates optional family name (min 1 character if provided).
 * Defaults to empty object to handle requests with missing body.
 *
 * @openapi CreateFamilyRequest
 */
export const createFamilyRequestSchema = z
  .object({
    name: z.string().min(1).optional(),
  })
  .default({})
  .openapi('CreateFamilyRequest');

/**
 * Response schema for a family object.
 * Contains family UUID identifier and optional friendly name.
 * Used for both creation responses and list operations.
 *
 * @openapi Family
 */
export const familySchema = z
  .object({
    id: z.uuid(),
    name: z.string().min(1).optional(),
  })
  .openapi('Family');

/** Type inferred from createFamilyRequestSchema for request payloads. */
export type CreateFamilyRequest = z.infer<typeof createFamilyRequestSchema>;

/** Type inferred from familySchema for response payloads. */
export type Family = z.infer<typeof familySchema>;
