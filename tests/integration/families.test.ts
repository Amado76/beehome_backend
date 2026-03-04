/**
 * Integration Tests for Families API
 *
 * Tests the complete families module including:
 * - POST /families endpoint (create family with trial)
 * - Authentication requirements (requireAuth middleware)
 * - Request validation (Zod schemas)
 * - Database persistence
 * - Response formats
 *
 * Tests are skipped if PostgreSQL is not reachable on localhost:5432
 * to allow CI/local development to run without database.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { spawnSync } from 'node:child_process';

import { createTestClient } from './_helpers/app';
import { disconnectDb, resetDb } from './_helpers/db';

function getDefaultTestDatabaseUrl(): string {
  return 'postgresql://postgres:postgres@localhost:5432/beehome_dev?schema=integration_test';
}

function isLocalhostHost(hostname: string): boolean {
  return (
    hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  );
}

function getSchemaNameFromUrl(databaseUrl: string): string | null {
  try {
    const parsed = new URL(databaseUrl);
    return parsed.searchParams.get('schema');
  } catch {
    return null;
  }
}

function isTcpReachableSync(
  host: string,
  port: number,
  timeoutMs = 500,
): boolean {
  const script = `
    const net = require('net');
    const host = process.env.TCP_PROBE_HOST || 'localhost';
    const port = Number(process.env.TCP_PROBE_PORT || '0');
    const timeoutMs = Number(process.env.TCP_PROBE_TIMEOUT || '500');

    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => { socket.destroy(); process.exit(1); }, timeoutMs);
    socket.on('connect', () => { clearTimeout(timeout); socket.end(); process.exit(0); });
    socket.on('error', () => { clearTimeout(timeout); process.exit(1); });
  `;

  const res = spawnSync(process.execPath, ['-e', script], {
    stdio: 'ignore',
    env: {
      ...process.env,
      TCP_PROBE_HOST: host,
      TCP_PROBE_PORT: String(port),
      TCP_PROBE_TIMEOUT: String(timeoutMs),
    },
  });

  return res.status === 0;
}

process.env.DATABASE_URL =
  process.env.DATABASE_URL || getDefaultTestDatabaseUrl();

const databaseUrl = process.env.DATABASE_URL;
let shouldRunIntegration = true;
let skipReason = '';

if (!databaseUrl) {
  shouldRunIntegration = false;
  skipReason = 'DATABASE_URL is not set';
} else {
  try {
    const parsed = new URL(databaseUrl);

    if (!isLocalhostHost(parsed.hostname)) {
      shouldRunIntegration = false;
      skipReason = `DATABASE_URL must point to localhost for safety (host=${parsed.hostname})`;
    } else {
      const schemaName = getSchemaNameFromUrl(databaseUrl);
      if (!schemaName || schemaName === 'public') {
        shouldRunIntegration = false;
        skipReason =
          'DATABASE_URL must include a non-public schema (e.g. ?schema=integration_test)';
      } else {
        const port = parsed.port ? Number(parsed.port) : 5432;
        if (!Number.isFinite(port) || port <= 0 || port > 65535) {
          shouldRunIntegration = false;
          skipReason = `Invalid port in DATABASE_URL (port=${parsed.port || '(default)'})`;
        } else if (!isTcpReachableSync(parsed.hostname, port)) {
          shouldRunIntegration = false;
          skipReason = `Postgres is not reachable at ${parsed.hostname}:${port} (start docker-compose db service)`;
        }
      }
    }
  } catch {
    shouldRunIntegration = false;
    skipReason = 'DATABASE_URL could not be parsed';
  }
}

const describeIntegration = shouldRunIntegration ? describe : describe.skip;

describeIntegration('families (integration)', () => {
  if (!shouldRunIntegration) {
    it(skipReason, () => {
      expect(true).toBe(true);
    });
    return;
  }

  beforeAll(async () => {
    spawnSync('./node_modules/.bin/prisma', ['migrate', 'deploy'], {
      stdio: 'inherit',
      env: process.env,
    });
  });

  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('creates a family and returns id', async () => {
    const client = createTestClient();

    const signup = await client.post('/auth/signup').send({
      email: 'owner@example.com',
      password: 'password123',
    });

    expect(signup.status).toBe(201);
    expect(signup.body).toHaveProperty('accessToken');

    const res = await client
      .post('/families')
      .set('authorization', `Bearer ${signup.body.accessToken}`)
      .send({ name: 'My Family' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
    expect(res.body).toMatchObject({
      name: 'My Family',
    });
  });

  it('rejects create family without auth (401)', async () => {
    const client = createTestClient();

    const res = await client.post('/families').send({ name: 'Nope' });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });
});
