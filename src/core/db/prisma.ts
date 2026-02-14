import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaShutdownHooksInstalled?: boolean;
};

const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

function setupPrismaShutdownHooks(prismaClient: PrismaClient): void {
  if (globalForPrisma.prismaShutdownHooksInstalled) return;
  globalForPrisma.prismaShutdownHooksInstalled = true;

  const disconnect = async (): Promise<void> => {
    try {
      await prismaClient.$disconnect();
    } catch (error) {
      console.debug('Error while disconnecting Prisma client during shutdown:', error);
    }
  };

  process.on('beforeExit', () => {
    void disconnect();
  });

  process.on('SIGINT', () => {
    void disconnect().finally(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    void disconnect().finally(() => {
      process.exit(0);
    });
  });
}

setupPrismaShutdownHooks(prisma);

export function getPrisma(): PrismaClient {
  return prisma;
}
