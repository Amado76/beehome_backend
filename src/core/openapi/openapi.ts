import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import type { JsonObject } from 'swagger-ui-express';

export const registry = new OpenAPIRegistry();

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function generateOpenApiDocument(params: {
  title: string;
  version: string;
  baseUrl: string;
}): JsonObject {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const baseDocument = generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: params.title,
      version: params.version,
    },
    servers: [{ url: params.baseUrl }],
  });

  if (!isPlainObject(baseDocument)) {
    throw new Error('OpenAPI generator returned a non-object document');
  }

  const doc = baseDocument;
  const existingComponents =
    typeof doc.components === 'object' && doc.components !== null
      ? (doc.components as Record<string, unknown>)
      : {};

  return {
    ...doc,
    components: {
      ...existingComponents,
      securitySchemes: {
        ...(typeof existingComponents.securitySchemes === 'object' &&
        existingComponents.securitySchemes !== null
          ? (existingComponents.securitySchemes as Record<string, unknown>)
          : {}),
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  } as JsonObject;
}
