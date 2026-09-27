import { and, eq } from 'drizzle-orm';
import { invitation, role } from '@flowpilot/db';

import type { Database } from '@flowpilot/db';
import type { SupabaseAdminClient } from '../../lib/supabase-admin.js';

type CreateInvitationParams = {
  db: Database;
  supabase: SupabaseAdminClient;
  businessId: string;
  roleId: string;
  email: string;
  invitedByUserId: string;
};

export async function createInvitation({
  db,
  supabase,
  businessId,
  roleId,
  email,
  invitedByUserId,
}: CreateInvitationParams) {
  const normalizedEmail = email.trim().toLowerCase();
  //MARK: Role validation
  const [targetRole] = await db
    .select({
      id: role.id,
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

  //MARK: Create invitation in the database
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
  const { error } =
    await supabase.auth.admin.inviteUserByEmail(normalizedEmail);

  //MARK: Handle Supabase invitation error
  if (error) {
    await db.delete(invitation).where(eq(invitation.id, createdInvitation.id));

    throw new Error(`Failed to send Supabase invitation: ${error.message}`);
  }

  return {
    ok: true as const,
    invitation: createdInvitation,
  };
}
