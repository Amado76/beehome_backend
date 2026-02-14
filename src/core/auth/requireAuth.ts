import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

import { AppError } from '../errors/AppError';
import { getJwtSecret } from './jwtSecret';

const claimsSchema = z.object({
  sub: z.string().uuid(),
});

type Claims = z.infer<typeof claimsSchema>;

function getBearerToken(params: { authorizationHeader: string | undefined }): string {
  const value = params.authorizationHeader;
  if (!value) {
    throw new AppError({
      code: 'UNAUTHORIZED',
      message: 'Missing Authorization header',
      statusCode: 401,
    });
  }

  const [scheme, token] = value.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AppError({
      code: 'UNAUTHORIZED',
      message: 'Invalid Authorization header',
      statusCode: 401,
    });
  }

  return token;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const token = getBearerToken({
      authorizationHeader: req.header('authorization') ?? undefined,
    });

    const secret = getJwtSecret();

    let decoded: unknown;
    try {
      decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new AppError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        statusCode: 401,
      });
    }

    const parsed = claimsSchema.safeParse(decoded);
    if (!parsed.success) {
      throw new AppError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token claims',
        statusCode: 401,
      });
    }

    const claims: Claims = parsed.data;
    req.ctx = req.ctx ?? {};
    req.ctx.auth = { userId: claims.sub };

    return next();
  } catch (err) {
    return next(err);
  }
};
