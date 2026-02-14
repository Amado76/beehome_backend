import { z } from '../../core/openapi/zod';

export const signUpRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .openapi('SignUpRequest');

export const loginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .openapi('LoginRequest');

export const authResponseSchema = z
  .object({
    accessToken: z.string().min(1),
  })
  .openapi('AuthResponse');

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
