import { appUser, business, invitation, membership, role } from '@flowpilot/db';
import { acceptInvitation } from '../../../src/services/identity/invitation-service.js';
import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest';
import {
  assertTestDatabase,
  cleanTestDatabase,
  deleteTestAuthUser,
  pool,
  db,
} from '../database.js';
import { eq } from 'drizzle-orm';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const BUSINESS_ID = '22222222-2222-4222-8222-222222222222';
const ROLE_ID = '33333333-3333-4333-8333-333333333333';
const INVITATION_ID = '44444444-4444-4444-8444-444444444444';

const USER_EMAIL = 'recipient@example.com';

async function seedInvitationScenario() {
  await pool.query(
    `
      INSERT INTO auth.users (id, email, raw_user_meta_data)
      VALUES ($1, $2, '{}'::jsonb)
    `,
    [USER_ID, USER_EMAIL],
  );

  await db.insert(business).values({
    id: BUSINESS_ID,
    name: 'Integration Test Business',
  });

  await db.insert(role).values({
    id: ROLE_ID,
    businessId: BUSINESS_ID,
    key: 'member',
    name: 'Member',
  });

  await db.insert(invitation).values({
    id: INVITATION_ID,
    businessId: BUSINESS_ID,
    email: USER_EMAIL,
    roleId: ROLE_ID,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });
}

describe('invitation service integration', () => {
  beforeAll(async () => {
    await assertTestDatabase();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    await deleteTestAuthUser(USER_ID);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('accepts a valid invitation and persists the resulting state', async () => {
    // Arrange
    await seedInvitationScenario();

    // Act
    const result = await acceptInvitation({
      db,
      invitationId: INVITATION_ID,
      userId: USER_ID,
      userEmail: `  ${USER_EMAIL.toUpperCase()}  `,
      firstName: 'Integration',
      lastName: 'User',
    });

    // Assert
    expect(result).toEqual({
      ok: true,
    });

    const [createdUser] = await db
      .select({
        id: appUser.id,
        email: appUser.email,
        firstName: appUser.firstName,
        lastName: appUser.lastName,
      })
      .from(appUser)
      .where(eq(appUser.id, USER_ID));

    expect(createdUser).toEqual({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'Integration',
      lastName: 'User',
    });

    const [acceptedInvitation] = await db
      .select({
        acceptedAt: invitation.acceptedAt,
        acceptedByUserId: invitation.acceptedByUserId,
        revokedAt: invitation.revokedAt,
      })
      .from(invitation)
      .where(eq(invitation.id, INVITATION_ID));

    expect(acceptedInvitation).toEqual({
      acceptedAt: expect.any(Date),
      acceptedByUserId: USER_ID,
      revokedAt: null,
    });

    const [createdMembership] = await db
      .select({
        userId: membership.userId,
        businessId: membership.businessId,
        roleId: membership.roleId,
      })
      .from(membership)
      .where(eq(membership.userId, USER_ID));

    expect(createdMembership).toEqual({
      userId: USER_ID,
      businessId: BUSINESS_ID,
      roleId: ROLE_ID,
    });
  });

  it('rejects acceptance when the user is already a business member', async () => {
    // Arrange
    await seedInvitationScenario();

    await db.insert(appUser).values({
      id: USER_ID,
      email: USER_EMAIL,
      firstName: 'Existing',
      lastName: 'Member',
    });

    await db.insert(membership).values({
      userId: USER_ID,
      businessId: BUSINESS_ID,
      roleId: ROLE_ID,
    });
    // Act
    const result = await acceptInvitation({
      db,
      invitationId: INVITATION_ID,
      userId: USER_ID,
      userEmail: USER_EMAIL,
      firstName: 'Integration',
      lastName: 'User',
    });

    // Assert
    expect(result).toEqual({
      ok: false,
      reason: 'user_already_member',
    });

    const [unchangedInvitation] = await db
      .select({
        acceptedAt: invitation.acceptedAt,
        acceptedByUserId: invitation.acceptedByUserId,
        revokedAt: invitation.revokedAt,
      })
      .from(invitation)
      .where(eq(invitation.id, INVITATION_ID));

    expect(unchangedInvitation).toEqual({
      acceptedAt: null,
      acceptedByUserId: null,
      revokedAt: null,
    });

    const [unchangedUser] = await db
      .select({
        email: appUser.email,
        firstName: appUser.firstName,
        lastName: appUser.lastName,
      })
      .from(appUser)
      .where(eq(appUser.id, USER_ID));

    expect(unchangedUser).toEqual({
      email: USER_EMAIL,
      firstName: 'Existing',
      lastName: 'Member',
    });

    const memberships = await db
      .select({
        userId: membership.userId,
        businessId: membership.businessId,
        roleId: membership.roleId,
      })
      .from(membership)
      .where(eq(membership.userId, USER_ID));

    expect(memberships).toEqual([
      {
        userId: USER_ID,
        businessId: BUSINESS_ID,
        roleId: ROLE_ID,
      },
    ]);
  });
});
