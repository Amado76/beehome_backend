import type { Router } from 'express';
import { Router as createRouter } from 'express';
import swaggerUi from 'swagger-ui-express';

import { getPublicBaseUrl } from '../../config/publicBaseUrl';
import { generateOpenApiDocument } from '../../core/openapi/openapi';
import { registerAllOpenApi } from '../../core/openapi/registerAll';

export function buildDocsRouter(): Router {
  const router = createRouter();

  registerAllOpenApi();

  router.use('/', swaggerUi.serve);
  router.get('/', (req, res, next) => {
    const baseUrl = getPublicBaseUrl(req);

    const document = generateOpenApiDocument({
      title: 'BeeHome Planner API (MVP)',
      version: '0.1.0',
      baseUrl,
    });

    return swaggerUi.setup(document)(req, res, next);
  });

  return router;
}
