import { AppError } from '../../core/errors/AppError';
import type { FamilyRole } from '../../core/auth/authTypes';
import * as repo from './families.repo';

/**
 * Repository interface for family data operations.
 * Defines the contract that the service depends on for database interactions.
 * This enables dependency injection and makes the service testable.
 */
export type FamiliesRepo = {
  createFamilyWithOwner: typeof repo.createFamilyWithOwner;
  countActiveAdultMemberships: typeof repo.countActiveAdultMemberships;
  createAdultMembership: typeof repo.createAdultMembership;
};

/**
 * Service interface for family business logic operations.
 * Handles validation, orchestration, and coordination of family-related workflows.
 */
export type FamiliesService = {
  /**
   * Creates a new family with automatic trial license initialization.
   * The creating user becomes the ADMIN member.
   */
  createFamily(params: {
    ownerUserId: string;
    name?: string;
  }): Promise<{ id: string; name?: string }>;

  /**
   * Adds an adult member to an existing family.
   * Enforces the maximum 2-adult limit per family.
   */
  addAdultToFamily(params: {
    familyId: string;
    userId: string;
    role: FamilyRole;
  }): Promise<void>;
};

/**
 * Factory function to create a FamiliesService instance.
 * Uses dependency injection to allow for testing with mock repositories.
 *
 * @param deps.repo - Repository instance for data operations
 * @param deps.now - Function returning current Date (allows mocking in tests)
 * @param deps.trialDays - Number of days the trial period lasts (default: 30)
 * @returns FamiliesService instance with all business logic methods
 */
export function buildFamiliesService(deps: {
  repo: FamiliesRepo;
  now: () => Date;
  trialDays: number;
}): FamiliesService {
  return {
    /**
     * Implementation of createFamily.
     * Calculates trial end date based on configured trial period,
     * delegates to repo for database creation, and returns simplified response.
     */
    async createFamily(params) {
      const now = deps.now();
      const trialStartedAt = now;
      const trialEndsAt = new Date(
        now.getTime() + deps.trialDays * 24 * 60 * 60 * 1000,
      );

      const family = await deps.repo.createFamilyWithOwner({
        ownerUserId: params.ownerUserId,
        name: params.name ?? null,
        trialStartedAt,
        trialEndsAt,
      });

      return {
        id: family.id,
        ...(family.name ? { name: family.name } : {}),
      };
    },

    /**
     * Implementation of addAdultToFamily.
     * First checks the current adult count and enforces the 2-adult maximum.
     * Throws ADULT_LIMIT_REACHED if limit would be exceeded.
     * If validation passes, delegates to repo to create the membership.
     */
    async addAdultToFamily(params) {
      const activeAdults = await deps.repo.countActiveAdultMemberships({
        familyId: params.familyId,
      });

      // Enforce maximum 2 adults per family (Fr-001)
      if (activeAdults >= 2) {
        throw new AppError({
          code: 'ADULT_LIMIT_REACHED',
          message: 'Family already has the maximum number of adults',
          statusCode: 400,
        });
      }

      await deps.repo.createAdultMembership({
        familyId: params.familyId,
        userId: params.userId,
        role: params.role,
      });
    },
  };
}

/**
 * Convenience factory that creates and wires all dependencies.
 * Used in production; tests typically call buildFamiliesService directly with mocks.
 *
 * @returns FamiliesService instance fully configured with real repository and environment
 */
export function createFamiliesService(): FamiliesService {
  return buildFamiliesService({
    repo: {
      createFamilyWithOwner: repo.createFamilyWithOwner,
      countActiveAdultMemberships: repo.countActiveAdultMemberships,
      createAdultMembership: repo.createAdultMembership,
    },
    now: () => new Date(),
    trialDays: 30,
  });
}
