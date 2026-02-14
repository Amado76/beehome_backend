import type { RequestHandler } from 'express';

import { AppError } from '../../core/errors/AppError';

const DEFAULT_EXEMPT_PREFIXES = [
  '/health',
  '/docs',
  '/auth',
  '/license',
  '/billing',
  '/dashboard',
];

export function isPaywallExemptRequest(params: {
  path: string;
  exemptPrefixes?: string[];
}): boolean {
  const prefixes = params.exemptPrefixes ?? DEFAULT_EXEMPT_PREFIXES;
  return prefixes.some((prefix) => params.path === prefix || params.path.startsWith(`${prefix}/`));
}

export function createPaywallMiddleware(options?: {
  exemptPrefixes?: string[];
}): RequestHandler {
  return (req, _res, next) => {
    const fullPath = `${req.baseUrl}${req.path}`;
    try {
      const exemptPrefixes = options?.exemptPrefixes;
      if (isPaywallExemptRequest(exemptPrefixes ? { path: fullPath, exemptPrefixes } : { path: fullPath })) {
        return next();
      }

      const isLicensed = req.ctx?.license?.isLicensed ?? false;
      if (!isLicensed) {
        throw new AppError({
          code: 'LICENSE_REQUIRED',
          message: 'License required',
          statusCode: 402,
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}
