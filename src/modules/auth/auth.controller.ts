import type { RequestHandler } from 'express';

import { asyncHandler } from '../../core/http/asyncHandler';
import type { AuthService } from './auth.service';

export function buildAuthController(service: AuthService): {
  signup: RequestHandler;
  login: RequestHandler;
} {
  return {
    signup: asyncHandler(async (req, res) => {
      const body = req.body as { email: string; password: string };
      const result = await service.signupWithEmailPassword(body);
      res.status(201).json(result);
    }),

    login: asyncHandler(async (req, res) => {
      const body = req.body as { email: string; password: string };
      const result = await service.loginWithEmailPassword(body);
      res.status(200).json(result);
    }),
  };
}
