import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { spawnSync } from 'node:child_process';

import { createTestClient } from './_helpers/app';
import { disconnectDb, resetDb } from './_helpers/db';

/**
 * Integration tests require a reachable local Postgres.
 *
 * Safety:
 * - These tests reset data by deleting rows from application tables.
 * - To reduce the risk of wiping a developer DB, we default to an isolated Postgres schema.
 * - If you override DATABASE_URL, keep `schema=integration_test` (or set ALLOW_NONLOCAL_DB_RESET=true explicitly).
 */
function getDefaultTestDatabaseUrl(): string {
  return 'postgresql://postgres:postgres@localhost:5432/beehome_dev?schema=integration_test';
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function getSchemaNameFromUrl(databaseUrl: string): string | null {
  try {
    const parsed = new URL(databaseUrl);
    return parsed.searchParams.get('schema');
  } catch {
    return null;
  }
}

/**
 * Best-effort synchronous connectivity probe.
 *
 * We do this at module-evaluation time so we can choose `describe` vs `describe.skip` deterministically.
 */
function isTcpReachableSync(host: string, port: number, timeoutMs = 500): boolean {
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

process.env.DATABASE_URL = process.env.DATABASE_URL || getDefaultTestDatabaseUrl();

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
        skipReason = 'DATABASE_URL must include a non-public schema (e.g. ?schema=integration_test)';
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

describeIntegration('auth (integration)', () => {
  if (!shouldRunIntegration) {
    it(skipReason, () => {
      expect(true).toBe(true);
    });
    return;
  }

  beforeAll(async () => {
    // Ensure the schema is migrated before we start deleting/inserting rows.
    // Uses DATABASE_URL (including the schema) from the process env.
    spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
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

  it('signs up and returns access token', async () => {
    const client = createTestClient();

    const res = await client.post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('logs in and returns access token', async () => {
    const client = createTestClient();

    await client.post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
    });

    const res = await client.post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('rejects duplicate signup with EMAIL_TAKEN', async () => {
    const client = createTestClient();

    const first = await client.post('/auth/signup').send({
      email: 'dup@example.com',
      password: 'password123',
    });

    expect(first.status).toBe(201);

    const second = await client.post('/auth/signup').send({
      email: 'dup@example.com',
      password: 'password123',
    });

    expect(second.status).toBe(400);
    expect(second.body).toMatchObject({
      error: {
        code: 'EMAIL_TAKEN',
      },
    });
  });

  it('rejects login with wrong password (401)', async () => {
    const client = createTestClient();

    await client.post('/auth/signup').send({
      email: 'wrongpass@example.com',
      password: 'password123',
    });

    const res = await client.post('/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'not-the-right-password',
    });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      error: {
        code: 'UNAUTHORIZED',
      },
    });
  });

  it('returns VALIDATION_ERROR for invalid signup payload', async () => {
    const client = createTestClient();

    const res = await client.post('/auth/signup').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
    expect(typeof res.body.error?.message).toBe('string');
  });

  it('returns VALIDATION_ERROR for invalid login payload', async () => {
    const client = createTestClient();

    const res = await client.post('/auth/login').send({
      email: 'not-an-email',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
      },
    });
    expect(typeof res.body.error?.message).toBe('string');
  });
});
