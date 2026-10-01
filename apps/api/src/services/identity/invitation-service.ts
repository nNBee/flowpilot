import { and, eq, isNull, sql } from 'drizzle-orm';
import { invitation, role } from '@flowpilot/db';

import type { Database } from '@flowpilot/db';
import type { SupabaseAdminClient } from '../../lib/supabase-admin.js';

type PgError = {
  code?: string;
  constraint?: string;
};

function isPgError(error: unknown): error is PgError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'constraint' in error)
  );
}
type Logger = {
  error: (error: unknown, message: string) => void;
};

type CreateInvitationParams = {
  db: Database;
  supabase: SupabaseAdminClient;
  inviterRoleId: string;
  businessId: string;
  roleId: string;
  email: string;
  invitedByUserId: string;
  logger?: Logger;
};

export async function createInvitation({
  db,
  supabase,
  inviterRoleId,
  businessId,
  roleId,
  email,
  invitedByUserId,
  logger,
}: CreateInvitationParams) {
  const normalizedEmail = email.trim().toLowerCase();
  //MARK: Role validation
  const [targetRole] = await db
    .select({
      id: role.id,
      key: role.key,
    })
    .from(role)
    .where(and(eq(role.id, roleId), eq(role.businessId, businessId)))
    .limit(1);

  if (!targetRole) {
    return {
      ok: false as const,
      reason: 'role_not_found' as const,
    };
  }

  const [inviterRole] = await db
    .select({
      id: role.id,
      key: role.key,
    })
    .from(role)
    .where(and(eq(role.id, inviterRoleId), eq(role.businessId, businessId)))
    .limit(1);

  if (!inviterRole) {
    return {
      ok: false as const,
      reason: 'inviter_role_not_found' as const,
    };
  }

  if (inviterRole.key !== 'owner' && inviterRole.key !== 'admin') {
    return {
      ok: false as const,
      reason: 'role_not_assignable' as const,
    };
  }

  if (targetRole.key === 'owner') {
    return {
      ok: false as const,
      reason: 'role_not_assignable' as const,
    };
  }

  if (inviterRole.key === 'admin' && targetRole.key === 'admin') {
    return {
      ok: false as const,
      reason: 'role_not_assignable' as const,
    };
  }

  const [existingInvitation] = await db
    .select({
      id: invitation.id,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(
      and(
        eq(invitation.businessId, businessId),
        isNull(invitation.acceptedAt),
        isNull(invitation.revokedAt),
        sql`lower(btrim(${invitation.email})) = ${normalizedEmail}`,
      ),
    )
    .limit(1);

  if (existingInvitation) {
    if (existingInvitation.expiresAt > new Date()) {
      return {
        ok: false as const,
        reason: 'invitation_already_exists' as const,
      };
    }

    await db
      .update(invitation)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(invitation.id, existingInvitation.id));
  }

  //MARK: Create invitation in the database
  try {
    const [createdInvitation] = await db
      .insert(invitation)
      .values({
        businessId,
        email: normalizedEmail,
        roleId,
        invitedByUserId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning();

    if (!createdInvitation) {
      throw new Error('Failed to create invitation');
    }

    //MARK: Send Supabase invitation
    try {
      const { error } =
        await supabase.auth.admin.inviteUserByEmail(normalizedEmail);

      if (error) {
        throw new Error('SUPABASE_INVITE_FAILED');
      }
    } catch {
      try {
        await db
          .delete(invitation)
          .where(eq(invitation.id, createdInvitation.id));
      } catch (cleanupError) {
        logger?.error(
          cleanupError,
          'Failed to clean up invitation after Supabase invite failure',
        );
      }

      throw new Error('Failed to send invitation');
    }

    return {
      ok: true as const,
      invitation: createdInvitation,
    };
  } catch (error) {
    if (
      isPgError(error) &&
      error.code === '23505' &&
      error.constraint === 'invitation_active_business_email_unique'
    ) {
      return {
        ok: false as const,
        reason: 'invitation_already_exists' as const,
      };
    }

    throw error;
  }
}
