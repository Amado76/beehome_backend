import { getPrisma } from '../../../src/core/db/prisma';

export async function resetDb(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv === 'production') {
    throw new Error('resetDb() is not allowed when NODE_ENV=production');
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('resetDb() requires DATABASE_URL to be set');
  }

  // Extra guard to reduce the chance of wiping a non-local database by accident.
  // If you really need to reset a remote DB in dev/test, set ALLOW_NONLOCAL_DB_RESET=true.
  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname;
    const allowNonLocal = process.env.ALLOW_NONLOCAL_DB_RESET === 'true';
    const isLocalHost =
      host === 'localhost' || host === '127.0.0.1' || host === '::1';

    if (!isLocalHost && !allowNonLocal) {
      throw new Error(
        `resetDb() refused to run against non-local host (${host}). Set ALLOW_NONLOCAL_DB_RESET=true to override.`,
      );
    }
  } catch (error) {
    const allowNonLocal = process.env.ALLOW_NONLOCAL_DB_RESET === 'true';
    if (!allowNonLocal) {
      const originalMessage =
        error instanceof Error && error.message
          ? ` Original error: ${error.message}`
          : '';
      throw new Error(
        'resetDb() refused to run because DATABASE_URL could not be parsed. Set ALLOW_NONLOCAL_DB_RESET=true to override.' +
          originalMessage,
      );
    }
  }

  const prisma = getPrisma();

  // Only clear application tables we know about, using Prisma's transaction API.
  // Delete in reverse dependency order (children first, parents last) to satisfy FK constraints.
  await prisma.$transaction(async (tx) => {
    // Most dependent tables first
    await tx.familyLicenseAudit.deleteMany();
    await tx.familyLicense.deleteMany();
    await tx.cycle.deleteMany();
    await tx.academicYearSettings.deleteMany();
    await tx.childProfile.deleteMany();
    await tx.familyInvite.deleteMany();
    await tx.membership.deleteMany();
    await tx.family.deleteMany();
    await tx.authIdentity.deleteMany();
    await tx.user.deleteMany();
  });
}

export async function disconnectDb(): Promise<void> {
  await getPrisma().$disconnect();
}
