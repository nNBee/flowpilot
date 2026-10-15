export const errors = {
  unauthorized: 'You are not authorized.',
  forbidden: 'You do not have permission to perform this action.',
  business_membership_required: 'Business membership is required.',

  invalid_request: 'Invalid request.',

  role_not_found: 'The selected role could not be found.',
  inviter_role_not_found: 'Your role could not be found.',
  role_not_assignable: 'This role cannot be assigned.',
  invitation_already_exists:
    'An invitation already exists for this email address.',
  user_already_member: 'This user is already a member.',

  invitation_not_found: 'This invitation could not be found.',
  invitation_revoked: 'This invitation is no longer available.',
  invitation_expired: 'This invitation has expired.',
  invitation_email_mismatch:
    'This invitation belongs to another email address.',
  invitation_already_accepted: 'This invitation has already been accepted.',
  invitation_no_longer_available: 'This invitation is no longer available.',
  user_email_required: 'A valid email address is required.',

  route_not_found: 'The requested page could not be found.',
  internal_server_error: 'Something went wrong. Please try again.',
  network_error: 'Unable to reach the server. Please try again.',
  unexpected_response: 'Something went wrong. Please try again.',
};
