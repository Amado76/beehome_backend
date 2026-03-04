/**
 * Unit Tests for FamiliesService
 *
 * Tests the business logic layer in isolation using mock repositories.
 * Verifies trial calculation, adult limit enforcement, and error handling.
 */

import { describe, expect, it } from 'vitest';

import { AppError } from '../../src/core/errors/AppError';
import { buildFamiliesService } from '../../src/modules/families/families.service';

describe('families service', () => {
  it('creates a family and starts a 30-day trial', async () => {
    const fixedNow = new Date('2026-03-04T12:00:00.000Z');

    const service = buildFamiliesService({
      repo: {
        createFamilyWithOwner: async ({
          ownerUserId,
          name,
          trialStartedAt,
          trialEndsAt,
        }) => {
          expect(ownerUserId).toBe('11111111-1111-1111-1111-111111111111');
          expect(name).toBe('Test Family');
          expect(trialStartedAt.toISOString()).toBe(fixedNow.toISOString());
          expect(trialEndsAt.getTime()).toBe(
            fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000,
          );
          return { id: 'f', name: name ?? null };
        },
        countActiveAdultMemberships: async () => 1,
        createAdultMembership: async () => ({ id: 'm' }),
      },
      now: () => fixedNow,
      trialDays: 30,
    });

    const result = await service.createFamily({
      ownerUserId: '11111111-1111-1111-1111-111111111111',
      name: 'Test Family',
    });

    expect(result).toEqual({ id: 'f', name: 'Test Family' });
  });

  it('rejects adding a 3rd adult to a family', async () => {
    const service = buildFamiliesService({
      repo: {
        createFamilyWithOwner: async () => ({ id: 'f', name: null }),
        countActiveAdultMemberships: async () => 2,
        createAdultMembership: async () => {
          throw new Error('should not be called');
        },
      },
      now: () => new Date('2026-03-04T12:00:00.000Z'),
      trialDays: 30,
    });

    await expect(
      service.addAdultToFamily({
        familyId: '22222222-2222-2222-2222-222222222222',
        userId: '33333333-3333-3333-3333-333333333333',
        role: 'CREATE_EDIT',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
