import type { Prisma } from '@prisma/client';

import { getPrisma } from '../../core/db/prisma';

export type AuthUserRecord = {
  id: string;
  email: string | null;
  passwordHash: string | null;
};

export async function findUserByEmail(params: {
  email: string;
}): Promise<AuthUserRecord | null> {
  const prisma = getPrisma();

  return prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true, email: true, passwordHash: true },
  });
}

export async function createUserWithEmailPassword(params: {
  email: string;
  passwordHash: string;
}): Promise<{ id: string }> {
  const prisma = getPrisma();

  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash: params.passwordHash,
      identities: {
        create: {
          provider: 'EMAIL_PASSWORD',
          providerSubject: params.email,
        },
      },
    } satisfies Prisma.UserCreateInput,
    select: { id: true },
  });

  return user;
}
