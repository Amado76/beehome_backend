import type { RequestHandler } from 'express';

import { AppError } from '../errors/AppError';
import type { FamilyRole } from './authTypes';
import { isRoleAtLeast } from './authTypes';

export function requireRole(required: FamilyRole): RequestHandler {
  return (req, _res, next) => {
    try {
      const role = req.ctx?.role;
      if (!role) {
        throw new AppError({
          code: 'FORBIDDEN',
          message: 'Missing role context',
          statusCode: 403,
        });
      }

      if (!isRoleAtLeast({ role, required })) {
        throw new AppError({
          code: 'FORBIDDEN',
          message: 'Insufficient role',
          statusCode: 403,
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
