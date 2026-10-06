import { describe, expect, it, vi } from 'vitest';
import type { Database } from '@flowpilot/db';

import type { SupabaseAdminClient } from '../../lib/supabase-admin.js';
import { acceptInvitation, createInvitation } from './invitation-service.js';

const businessId = '22222222-2222-4222-8222-222222222222';
const roleId = '33333333-3333-4333-8333-333333333333';
const userId = '44444444-4444-4444-8444-444444444444';
const inviterRoleId = '55555555-5555-4555-8555-555555555555';
const invitationId = '11111111-1111-4111-8111-111111111111';

function buildSelectMock(...queryResults: ReadonlyArray<readonly unknown[]>) {
  const limit = vi.fn();

  for (const result of queryResults) {
    limit.mockResolvedValueOnce(result);
  }

  const where = vi.fn().mockReturnValue({ limit });
  const innerJoin = vi.fn().mockReturnValue({ where });
  const from = vi.fn().mockReturnValue({ innerJoin, where });
  const select = vi.fn().mockReturnValue({ from });

  return { select, innerJoin };
}

describe('createInvitation', () => {
  it('allows an owner to invite an admin', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: 'admin' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const db = {
      select,
      insert,
    };

    const inviteUserByEmail = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: '  TEST@EXAMPLE.COM ',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: true,
      invitation: createdInvitation,
    });

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      }),
    );

    expect(inviteUserByEmail).toHaveBeenCalledTimes(1);
    expect(inviteUserByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('returns role_not_found when the role does not belong to the business', async () => {
    const insert = vi.fn();

    const { select } = buildSelectMock([]);

    const db = {
      select,
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'role_not_found',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('returns inviter_role_not_found when the inviter role does not belong to the business', async () => {
    const insert = vi.fn();

    const { select } = buildSelectMock([{ id: roleId, key: 'member' }], []);

    const db = {
      select,
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'inviter_role_not_found',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('does not allow an admin to invite another admin', async () => {
    const limit = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'admin',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: 'admin',
        },
      ]);

    const insert = vi.fn();

    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit,
          }),
        }),
      }),
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'role_not_assignable',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('does not allow the owner role to be assigned by invitation', async () => {
    const limit = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: 'owner',
        },
      ]);

    const insert = vi.fn();

    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit,
          }),
        }),
      }),
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'role_not_assignable',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('does not allow a non-admin and non-owner role to create invitations', async () => {
    const limit = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'member',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: 'member',
        },
      ]);

    const insert = vi.fn();

    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit,
          }),
        }),
      }),
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'role_not_assignable',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('deletes the invitation when the Supabase invite fails', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: 'admin' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const deleteWhere = vi.fn().mockResolvedValue(undefined);

    const deleteFn = vi.fn().mockReturnValue({
      where: deleteWhere,
    });

    const db = {
      select,
      insert,
      delete: deleteFn,
    };

    const inviteUserByEmail = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Invite failed',
      },
    });

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    try {
      await createInvitation({
        db: db as unknown as Database,
        supabase: supabase as unknown as SupabaseAdminClient,
        inviterRoleId,
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      });

      expect.fail('Expected createInvitation to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      const message = (error as Error).message;

      expect(message).toBe('Failed to send invitation');
      expect(message).not.toContain('Invite failed');
    }

    expect(inviteUserByEmail).toHaveBeenCalledTimes(1);
    expect(inviteUserByEmail).toHaveBeenCalledWith('test@example.com');

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });

  it('returns user_already_member when the invited user already belongs to the business', async () => {
    const { select, innerJoin } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [{ id: '66666666-6666-4666-8666-666666666666' }],
    );

    const insert = vi.fn();
    const inviteUserByEmail = vi.fn();

    const db = {
      select,
      insert,
    };

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'user_already_member',
    });

    expect(innerJoin).toHaveBeenCalledTimes(1);
    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('returns invitation_already_exists for duplicate active invitation', async () => {
    const { select } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const values = vi.fn().mockReturnValue({
      returning: vi.fn().mockRejectedValue({
        code: '23505',
        constraint: 'invitation_active_business_email_unique',
      }),
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const db = {
      select,
      insert,
    };

    const inviteUserByEmail = vi.fn();

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_already_exists',
    });

    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('cleans up the invitation when Supabase invite throws', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const deleteWhere = vi.fn().mockResolvedValue(undefined);

    const deleteFn = vi.fn().mockReturnValue({
      where: deleteWhere,
    });

    const db = {
      select,
      insert,
      delete: deleteFn,
    };

    const inviteUserByEmail = vi
      .fn()
      .mockRejectedValue(new Error('Network failure'));

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    await expect(
      createInvitation({
        db: db as unknown as Database,
        supabase: supabase as unknown as SupabaseAdminClient,
        inviterRoleId,
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      }),
    ).rejects.toThrow('Failed to send invitation');

    expect(inviteUserByEmail).toHaveBeenCalledTimes(1);

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });

  it('still throws the invitation error when cleanup also fails', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const deleteWhere = vi.fn().mockRejectedValue(new Error('Cleanup failed'));

    const deleteFn = vi.fn().mockReturnValue({
      where: deleteWhere,
    });

    const db = {
      select,
      insert,
      delete: deleteFn,
    };

    const inviteUserByEmail = vi
      .fn()
      .mockRejectedValue(new Error('Network failure'));

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const logger = {
      error: vi.fn(),
    };

    await expect(
      createInvitation({
        db: db as unknown as Database,
        supabase: supabase as unknown as SupabaseAdminClient,
        inviterRoleId,
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
        logger,
      }),
    ).rejects.toThrow('Failed to send invitation');

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);

    expect(logger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'Failed to clean up invitation after Supabase invite failure',
    );
  });

  it('revokes an expired active invitation and creates a new one', async () => {
    const expiredInvitationId = '77777777-7777-4777-8777-777777777777';

    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [
        {
          id: expiredInvitationId,
          expiresAt: new Date(Date.now() - 60_000),
        },
      ],
    );

    const updateWhere = vi.fn().mockResolvedValue(undefined);

    const set = vi.fn().mockReturnValue({
      where: updateWhere,
    });

    const update = vi.fn().mockReturnValue({
      set,
    });

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const db = {
      select,
      update,
      insert,
    };

    const inviteUserByEmail = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(update).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith({
      revokedAt: expect.any(Date),
    });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(inviteUserByEmail).toHaveBeenCalledWith('test@example.com');

    expect(result).toEqual({
      ok: true,
      invitation: createdInvitation,
    });
  });

  it.each([
    ['owner', 'member'],
    ['owner', 'custom'],
    ['admin', 'member'],
    ['admin', 'custom'],
  ])('allows %s to invite %s role', async (inviterRoleKey, targetRoleKey) => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const { select } = buildSelectMock(
      [{ id: roleId, key: targetRoleKey }],
      [{ id: inviterRoleId, key: inviterRoleKey }],
      [],
      [],
    );

    const returning = vi.fn().mockResolvedValue([createdInvitation]);

    const values = vi.fn().mockReturnValue({
      returning,
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const db = {
      select,
      insert,
    };

    const inviteUserByEmail = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail,
        },
      },
    };

    const result = await createInvitation({
      db: db as unknown as Database,
      supabase: supabase as unknown as SupabaseAdminClient,
      inviterRoleId,
      businessId,
      roleId,
      email: 'test@example.com',
      invitedByUserId: userId,
    });

    expect(result).toEqual({
      ok: true,
      invitation: createdInvitation,
    });

    expect(insert).toHaveBeenCalledTimes(1);
    expect(inviteUserByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('rethrows a 23505 error from a different constraint', async () => {
    const { select } = buildSelectMock(
      [{ id: roleId, key: 'member' }],
      [{ id: inviterRoleId, key: 'owner' }],
      [],
      [],
    );

    const databaseError = {
      code: '23505',
      constraint: 'some_other_unique_constraint',
    };

    const values = vi.fn().mockReturnValue({
      returning: vi.fn().mockRejectedValue(databaseError),
    });

    const insert = vi.fn().mockReturnValue({
      values,
    });

    const db = {
      select,
      insert,
    };

    const supabase = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(),
        },
      },
    };

    await expect(
      createInvitation({
        db: db as unknown as Database,
        supabase: supabase as unknown as SupabaseAdminClient,
        inviterRoleId,
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      }),
    ).rejects.toBe(databaseError);
  });
});

describe('acceptInvitation', () => {
  it('accepts a valid invitation and creates the FlowPilot user membership', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    // invitation claim
    const returning = vi.fn().mockResolvedValue([
      {
        id: invitationId,
      },
    ]);

    const updateWhere = vi.fn().mockReturnValue({
      returning,
    });

    const set = vi.fn().mockReturnValue({
      where: updateWhere,
    });

    const update = vi.fn().mockReturnValue({
      set,
    });

    // app_user insert
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

    const appUserValues = vi.fn().mockReturnValue({
      onConflictDoNothing,
    });

    // membership insert
    const membershipValues = vi.fn().mockResolvedValue(undefined);

    const insert = vi
      .fn()
      .mockReturnValueOnce({
        values: appUserValues,
      })
      .mockReturnValueOnce({
        values: membershipValues,
      });

    const membershipLimit = vi.fn().mockResolvedValue([]);

    const transactionSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: membershipLimit,
        }),
      }),
    });

    const tx = {
      update,
      insert,
      select: transactionSelect,
    };

    const transaction = vi.fn(async (callback) => {
      return callback(tx);
    });

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'TEST@EXAMPLE.COM',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: true,
    });

    expect(transaction).toHaveBeenCalledTimes(1);

    expect(update).toHaveBeenCalledTimes(1);

    expect(appUserValues).toHaveBeenCalledWith({
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(onConflictDoNothing).toHaveBeenCalledTimes(1);

    expect(membershipValues).toHaveBeenCalledWith({
      userId,
      businessId,
      roleId,
    });
  });

  it('returns invitation_not_found when the invitation does not exist', async () => {
    const limit = vi.fn().mockResolvedValue([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const transaction = vi.fn();

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_not_found',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('returns invitation_revoked when the invitation has been revoked', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: new Date(),
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const transaction = vi.fn();

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_revoked',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('returns invitation_already_accepted when the invitation was already accepted', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: new Date(),
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const transaction = vi.fn();

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_already_accepted',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('returns invitation_expired when the invitation has expired', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() - 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const transaction = vi.fn();

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_expired',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('returns invitation_email_mismatch when the authenticated user email does not match', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'invited@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const transaction = vi.fn();

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'other@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_email_mismatch',
    });

    expect(transaction).not.toHaveBeenCalled();
  });

  it('fails when the invitation can no longer be claimed', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const returning = vi.fn().mockResolvedValue([]);

    const updateWhere = vi.fn().mockReturnValue({
      returning,
    });

    const set = vi.fn().mockReturnValue({
      where: updateWhere,
    });

    const update = vi.fn().mockReturnValue({
      set,
    });

    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

    const appUserValues = vi.fn().mockReturnValue({
      onConflictDoNothing,
    });

    const insert = vi.fn().mockReturnValue({
      values: appUserValues,
    });

    const membershipLimit = vi.fn().mockResolvedValue([]);

    const transactionSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: membershipLimit,
        }),
      }),
    });

    const tx = {
      select: transactionSelect,
      update,
      insert,
    };

    const transaction = vi.fn(async (callback) => {
      return callback(tx);
    });

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invitation_no_longer_available',
    });

    expect(update).toHaveBeenCalledTimes(1);
  });

  it('returns user_already_member when the user is already a member of the business', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    // initial invitation lookup
    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    // app_user insert
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

    const appUserValues = vi.fn().mockReturnValue({
      onConflictDoNothing,
    });

    const insert = vi.fn().mockReturnValue({
      values: appUserValues,
    });

    // existing membership lookup inside the transaction
    const membershipLimit = vi.fn().mockResolvedValue([
      {
        id: '66666666-6666-4666-8666-666666666666',
      },
    ]);

    const transactionSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: membershipLimit,
        }),
      }),
    });

    const update = vi.fn();

    const tx = {
      select: transactionSelect,
      update,
      insert,
    };

    const transaction = vi.fn(async (callback) => {
      return callback(tx);
    });

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'TEST@EXAMPLE.COM',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'user_already_member',
    });

    expect(transaction).toHaveBeenCalledTimes(1);

    expect(appUserValues).toHaveBeenCalledWith({
      id: userId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(transactionSelect).toHaveBeenCalledTimes(1);

    // The invitation must not be claimed when the user is already a member.
    expect(update).not.toHaveBeenCalled();

    // Only the app_user insert is attempted.
    // The thrown domain error causes the real DB transaction to roll it back.
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('returns user_already_member when membership creation hits the unique constraint', async () => {
    const existingInvitation = {
      id: invitationId,
      businessId,
      email: 'test@example.com',
      roleId,
      expiresAt: new Date(Date.now() + 60_000),
      acceptedAt: null,
      revokedAt: null,
    };

    // initial invitation lookup
    const limit = vi.fn().mockResolvedValue([existingInvitation]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    // app_user insert
    const onConflictDoNothing = vi.fn().mockResolvedValue(undefined);

    const appUserValues = vi.fn().mockReturnValue({
      onConflictDoNothing,
    });

    // membership insert fails because another transaction
    // created the membership after our membership check
    const membershipValues = vi.fn().mockRejectedValue({
      code: '23505',
      constraint: 'membership_user_id_business_id_unique',
    });

    const insert = vi
      .fn()
      .mockReturnValueOnce({
        values: appUserValues,
      })
      .mockReturnValueOnce({
        values: membershipValues,
      });

    // no membership exists when we check
    const membershipLimit = vi.fn().mockResolvedValue([]);

    const transactionSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: membershipLimit,
        }),
      }),
    });

    // invitation claim succeeds
    const returning = vi.fn().mockResolvedValue([
      {
        id: invitationId,
      },
    ]);

    const updateWhere = vi.fn().mockReturnValue({
      returning,
    });

    const set = vi.fn().mockReturnValue({
      where: updateWhere,
    });

    const update = vi.fn().mockReturnValue({
      set,
    });

    const tx = {
      select: transactionSelect,
      update,
      insert,
    };

    const transaction = vi.fn(async (callback) => {
      return callback(tx);
    });

    const db = {
      select,
      transaction,
    };

    const result = await acceptInvitation({
      db: db as unknown as Database,
      invitationId,
      userId,
      userEmail: 'TEST@EXAMPLE.COM',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result).toEqual({
      ok: false,
      reason: 'user_already_member',
    });

    expect(transaction).toHaveBeenCalledTimes(1);

    // The pre-check did not find a membership.
    expect(membershipLimit).toHaveBeenCalledTimes(1);

    // The invitation claim succeeded before the membership race was detected.
    expect(update).toHaveBeenCalledTimes(1);

    // app_user + membership inserts were both attempted.
    expect(insert).toHaveBeenCalledTimes(2);

    expect(membershipValues).toHaveBeenCalledWith({
      userId,
      businessId,
      roleId,
    });
  });
});
