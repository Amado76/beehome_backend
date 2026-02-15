import { afterEach } from 'vitest';

/**
 * Global test environment defaults.
 *
 * Note: integration tests may still skip if Postgres is not reachable.
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

/**
 * Prisma reads `DATABASE_URL` when constructing the client.
 *
 * We set a safe default here so integration helpers that import Prisma at module load time
 * don't fail with "Environment variable not found: DATABASE_URL".
 *
 * Safety: uses an isolated Postgres schema to avoid clobbering the default `public` schema.
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/beehome_dev?schema=integration_test';

afterEach(() => {
  // reserved for future global cleanup
});
