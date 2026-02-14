import type { Router } from 'express';
import { Router as createRouter } from 'express';

import { validate } from '../../core/validation/validate';
import { buildAuthController } from './auth.controller';
import { loginRequestSchema, signUpRequestSchema } from './auth.schemas';
import { createAuthService } from './auth.service';

export function buildAuthRouter(): Router {
  const router = createRouter();
  const service = createAuthService();
  const controller = buildAuthController(service);

  router.post('/signup', validate({ body: signUpRequestSchema }), controller.signup);
  router.post('/login', validate({ body: loginRequestSchema }), controller.login);

  return router;
}
