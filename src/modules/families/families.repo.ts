import type { Prisma } from '@prisma/client';

import { getPrisma } from '../../core/db/prisma';

/**
 * Data shape returned from database queries for a Family.
 * Represents the minimal family information (id and optional name).
 */
export type FamilyRecord = {
  id: string;
  name: string | null;
};

/**
 * Creates a new family with the given owner as the initial ADMIN member.
 * Also initializes a TRIAL license with specified trial period.
 *
 * @param params.ownerUserId - UUID of the user who will own the family
 * @param params.name - Friendly family name (nullable)
 * @param params.trialStartedAt - ISO timestamp when trial period begins
 * @param params.trialEndsAt - ISO timestamp when trial period expires
 * @returns Promise<FamilyRecord> - Created family with id and name
 * @throws Database errors if creation fails
 */
export async function createFamilyWithOwner(params: {
  ownerUserId: string;
  name: string | null;
  trialStartedAt: Date;
  trialEndsAt: Date;
}): Promise<FamilyRecord> {
  const prisma = getPrisma();

  const family = await prisma.family.create({
    data: {
      name: params.name,
      memberships: {
        create: {
          userId: params.ownerUserId,
          role: 'ADMIN',
        },
      },
      license: {
        create: {
          status: 'TRIAL',
          trialStartedAt: params.trialStartedAt,
          trialEndsAt: params.trialEndsAt,
        },
      },
    } satisfies Prisma.FamilyCreateInput,
    select: { id: true, name: true },
  });

  return family;
}

/**
 * Counts the number of active adult memberships in a family.
 * A membership is considered active if it has not been revoked (revokedAt is null).
 * Note: Membership table only contains adults by design; children are in ChildProfile.
 *
 * @param params.familyId - UUID of the family to query
 * @returns Promise<number> - Count of active memberships (0 or more)
 * @throws Database errors if query fails
 */
export async function countActiveAdultMemberships(params: {
  familyId: string;
}): Promise<number> {
  const prisma = getPrisma();

  return prisma.membership.count({
    where: {
      familyId: params.familyId,
      revokedAt: null,
    },
  });
}

/**
 * Adds an existing user to a family as a new adult membership.
 * The membership role determines what actions the user can perform in the family context.
 *
 * @param params.familyId - UUID of the family to add the member to
 * @param params.userId - UUID of the user to add
 * @param params.role - Authorization level for this membership
 * @returns Promise<{ id: string }> - ID of the created membership
 * @throws Database errors if creation fails or relationship constraints violated
 */
export async function createAdultMembership(params: {
  familyId: string;
  userId: string;
  role: 'VIEW_ONLY' | 'CREATE_EDIT' | 'MANAGE_SETTINGS_GOALS' | 'ADMIN';
}): Promise<{ id: string }> {
  const prisma = getPrisma();

  const membership = await prisma.membership.create({
    data: {
      familyId: params.familyId,
      userId: params.userId,
      role: params.role,
    },
    select: { id: true },
  });

  return membership;
}
