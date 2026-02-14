import { describe, expect, it } from 'vitest';

import { AppError } from '../../src/core/errors/AppError';
import { buildAuthService } from '../../src/modules/auth/auth.service';

describe('auth service', () => {
  it('signs up a new user and returns token', async () => {
    const service = buildAuthService({
      repo: {
        findUserByEmail: async () => null,
        createUserWithEmailPassword: async () => ({ id: '11111111-1111-1111-1111-111111111111' }),
      },
      hashPassword: async (password) => `hashed:${password}`,
      verifyPassword: async () => true,
      signAccessToken: ({ userId }) => `token:${userId}`,
    });

    const result = await service.signupWithEmailPassword({
      email: 'Test@Example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('token:11111111-1111-1111-1111-111111111111');
  });

  it('rejects signup when email already exists', async () => {
    const service = buildAuthService({
      repo: {
        findUserByEmail: async () => ({
          id: 'u',
          email: 'test@example.com',
          passwordHash: 'hash',
        }),
        createUserWithEmailPassword: async () => {
          throw new Error('should not be called');
        },
      },
      hashPassword: async () => 'hash',
      verifyPassword: async () => true,
      signAccessToken: () => 'token',
    });

    await expect(
      service.signupWithEmailPassword({ email: 'test@example.com', password: 'password123' })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('logs in and returns token when password matches', async () => {
    const service = buildAuthService({
      repo: {
        findUserByEmail: async () => ({
          id: '22222222-2222-2222-2222-222222222222',
          email: 'test@example.com',
          passwordHash: 'hash',
        }),
        createUserWithEmailPassword: async () => {
          throw new Error('should not be called');
        },
      },
      hashPassword: async () => 'hash',
      verifyPassword: async () => true,
      signAccessToken: ({ userId }) => `token:${userId}`,
    });

    const result = await service.loginWithEmailPassword({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('token:22222222-2222-2222-2222-222222222222');
  });

  it('rejects login when password mismatches', async () => {
    const service = buildAuthService({
      repo: {
        findUserByEmail: async () => ({
          id: '22222222-2222-2222-2222-222222222222',
          email: 'test@example.com',
          passwordHash: 'hash',
        }),
        createUserWithEmailPassword: async () => {
          throw new Error('should not be called');
        },
      },
      hashPassword: async () => 'hash',
      verifyPassword: async () => false,
      signAccessToken: () => 'token',
    });

    await expect(
      service.loginWithEmailPassword({ email: 'test@example.com', password: 'bad' })
    ).rejects.toBeInstanceOf(AppError);
  });
});
