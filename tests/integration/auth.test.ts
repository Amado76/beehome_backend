import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createTestClient } from './_helpers/app';
import { disconnectDb, resetDb } from './_helpers/db';

const hasDb = !!process.env.DATABASE_URL;

describe('auth (integration)', () => {
  if (!hasDb) {
    it.skip('DATABASE_URL not set', () => {
      expect(true).toBe(true);
    });
    return;
  }

  beforeEach(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
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
