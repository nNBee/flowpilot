import { describe, expect, it, vi } from 'vitest';
import type { Database } from '@flowpilot/db';

import type { SupabaseAdminClient } from '../../lib/supabase-admin.js';
import { createInvitation } from './invitation-service.js';

const businessId = '22222222-2222-4222-8222-222222222222';
const roleId = '33333333-3333-4333-8333-333333333333';
const userId = '44444444-4444-4444-8444-444444444444';
const inviterRoleId = '55555555-5555-4555-8555-555555555555';
const invitationId = '11111111-1111-4111-8111-111111111111';

describe('createInvitation', () => {
  it('allows an owner to invite an admin', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

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
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
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
    const limit = vi.fn().mockResolvedValue([]);

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
      reason: 'role_not_found',
    });

    expect(insert).not.toHaveBeenCalled();
    expect(inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('returns inviter_role_not_found when the inviter role does not belong to the business', async () => {
    const limit = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'member',
        },
      ])
      .mockResolvedValueOnce([]);

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
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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

  it('returns invitation_already_exists for duplicate active invitation', async () => {
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
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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
          key: 'owner',
        },
      ])
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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

    const limit = vi
      .fn()
      // target role
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'member',
        },
      ])
      // inviter role
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: 'owner',
        },
      ])
      // existing expired invitation
      .mockResolvedValueOnce([
        {
          id: expiredInvitationId,
          expiresAt: new Date(Date.now() - 60_000),
        },
      ]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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

    const limit = vi
      .fn()
      // target role
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: targetRoleKey,
        },
      ])
      // inviter role
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: inviterRoleKey,
        },
      ])
      // no existing active invitation
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
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
    const limit = vi
      .fn()
      // target role
      .mockResolvedValueOnce([
        {
          id: roleId,
          key: 'member',
        },
      ])
      // inviter role
      .mockResolvedValueOnce([
        {
          id: inviterRoleId,
          key: 'owner',
        },
      ])
      // no existing active invitation
      .mockResolvedValueOnce([]);

    const select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

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
