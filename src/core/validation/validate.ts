import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';
import { z } from 'zod';

export function validate<
  TBody = unknown,
  TQuery = ParsedQs,
  TParams = ParamsDictionary,
  TResBody = unknown
>(schemas: {
  body?: z.ZodType<TBody>;
  query?: z.ZodType<TQuery>;
  params?: z.ZodType<TParams>;
}): RequestHandler<TParams, TResBody, TBody, TQuery> {
  return (req, _res, next) => {
    try {
      const validated: { body?: unknown; query?: unknown; params?: unknown } = {};

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }

      // Attach validated data to a separate property to avoid mutating original request data.
      (req as any).validated = {
        ...(req as any).validated,
        ...validated,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
