import type { RequestHandler } from 'express';
import { z } from 'zod';

import { AppError } from '../errors/AppError';

const familyIdSchema = z.string().uuid();

export const requireFamily: RequestHandler = (req, _res, next) => {
  try {
    const raw = req.header('x-family-id');

    if (!raw) {
      throw new AppError({
        code: 'FAMILY_REQUIRED',
        message: 'Missing X-Family-Id header',
        statusCode: 400,
      });
    }

    const parsed = familyIdSchema.safeParse(raw);
    if (!parsed.success) {
      throw new AppError({
        code: 'FAMILY_REQUIRED',
        message: 'Invalid X-Family-Id header',
        statusCode: 400,
      });
    }

    req.ctx = req.ctx ?? {};
    req.ctx.familyId = parsed.data;

    return next();
  } catch (err) {
    return next(err);
  }
};
