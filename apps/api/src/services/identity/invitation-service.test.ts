import { describe, expect, it, vi } from 'vitest';
import type { Database } from '@flowpilot/db';

import type { SupabaseAdminClient } from '../../lib/supabase-admin.js';
import { createInvitation } from './invitation-service.js';

const businessId = '22222222-2222-4222-8222-222222222222';
const roleId = '33333333-3333-4333-8333-333333333333';
const userId = '44444444-4444-4444-8444-444444444444';
const invitationId = '11111111-1111-4111-8111-111111111111';

describe('createInvitation', () => {
  it('creates an invitation and sends the Supabase invite', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const limit = vi.fn().mockResolvedValue([
      {
        id: roleId,
      },
    ]);

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

  it('deletes the invitation when the Supabase invite fails', async () => {
    const createdInvitation = {
      id: invitationId,
      businessId,
      roleId,
      email: 'test@example.com',
    };

    const limit = vi.fn().mockResolvedValue([
      {
        id: roleId,
      },
    ]);

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

    await expect(
      createInvitation({
        db: db as unknown as Database,
        supabase: supabase as unknown as SupabaseAdminClient,
        businessId,
        roleId,
        email: 'test@example.com',
        invitedByUserId: userId,
      }),
    ).rejects.toThrow('Failed to send Supabase invitation');

    expect(inviteUserByEmail).toHaveBeenCalledTimes(1);
    expect(inviteUserByEmail).toHaveBeenCalledWith('test@example.com');

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(deleteWhere).toHaveBeenCalledTimes(1);
  });
});
