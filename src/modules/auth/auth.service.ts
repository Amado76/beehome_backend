import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { AppError } from '../../core/errors/AppError';
import { getJwtSecret } from '../../core/auth/jwtSecret';
import * as repo from './auth.repo';

export type AuthRepo = {
  findUserByEmail: typeof repo.findUserByEmail;
  createUserWithEmailPassword: typeof repo.createUserWithEmailPassword;
};

export type AuthService = {
  signupWithEmailPassword(params: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }>;

  loginWithEmailPassword(params: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }>;
};

export function buildAuthService(deps: {
  repo: AuthRepo;
  hashPassword: (password: string) => Promise<string>;
  verifyPassword: (params: { password: string; passwordHash: string }) => Promise<boolean>;
  signAccessToken: (params: { userId: string }) => string;
}): AuthService {
  return {
    async signupWithEmailPassword(params) {
      const email = params.email.toLowerCase().trim();

      const existing = await deps.repo.findUserByEmail({ email });
      if (existing) {
        throw new AppError({
          code: 'EMAIL_TAKEN',
          message: 'Email already in use',
          statusCode: 400,
        });
      }

      const passwordHash = await deps.hashPassword(params.password);
      const user = await deps.repo.createUserWithEmailPassword({
        email,
        passwordHash,
      });

      const accessToken = deps.signAccessToken({ userId: user.id });
      return { accessToken };
    },

    async loginWithEmailPassword(params) {
      const email = params.email.toLowerCase().trim();

      const user = await deps.repo.findUserByEmail({ email });
      if (!user || !user.passwordHash) {
        throw new AppError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      const ok = await deps.verifyPassword({
        password: params.password,
        passwordHash: user.passwordHash,
      });

      if (!ok) {
        throw new AppError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
          statusCode: 401,
        });
      }

      const accessToken = deps.signAccessToken({ userId: user.id });
      return { accessToken };
    },
  };
}

export function createAuthService(): AuthService {
  const defaultBcryptCost = 12;
  const maxBcryptCost = 16;
  const envBcryptCost = process.env.BCRYPT_COST;
  const parsedBcryptCost = envBcryptCost ? parseInt(envBcryptCost, 10) : defaultBcryptCost;
  const isValidParsedCost =
    Number.isFinite(parsedBcryptCost) && parsedBcryptCost > 0 && parsedBcryptCost <= maxBcryptCost;
  const BCRYPT_COST = isValidParsedCost ? parsedBcryptCost : defaultBcryptCost;

  return buildAuthService({
    repo: {
      findUserByEmail: repo.findUserByEmail,
      createUserWithEmailPassword: repo.createUserWithEmailPassword,
    },
    hashPassword: async (password) => bcrypt.hash(password, BCRYPT_COST),
    verifyPassword: async ({ password, passwordHash }) => bcrypt.compare(password, passwordHash),
    signAccessToken: ({ userId }) => {
      const secret = getJwtSecret();
      return jwt.sign({}, secret, {
        subject: userId,
        expiresIn: '7d',
        algorithm: 'HS256',
      });
    },
  });
}
