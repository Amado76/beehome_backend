import type { RequestContext } from '../core/auth/authTypes';

declare global {
  namespace Express {
    interface Request {
      ctx?: RequestContext;
    }
  }
}

export {};
