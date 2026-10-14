export const en = {
  common: {
    loading: 'Loading...',
  },

  invitation: {
    invalid: 'Invalid invitation.',
    expired: 'Invalid or expired invitation link.',

    firstName: 'First name',
    lastName: 'Last name',
    password: 'Password',
    confirmPassword: 'Confirm password',
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',

    accept: 'Accept invitation',

    acceptedTitle: 'Invitation accepted',
    acceptedDescription: 'Your account has been set up successfully.',
  },

  validation: {
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',
    passwordMinLength: 'Password must be at least {{count}} characters.',
    confirmPasswordRequired: 'Please confirm your password.',
    passwordsDoNotMatch: 'Passwords do not match.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Password is required.',
  },

  errors: {
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
  },

  home: {
    eyebrow: 'Business management, simplified',
    title: 'Keep your business moving in one place.',
    description:
      'FlowPilot brings your daily operations, team and customer workflows together in one clear workspace.',
    primaryAction: 'Get started',
    secondaryAction: 'Learn more',
  },

  auth: {
    login: 'Log in',
    email: 'Email',
    password: 'Password',
    invalidCredentials: 'Invalid email or password.',
    loginFailed: 'Unable to sign in. Please try again.',
    loginTitle: 'Welcome back',
    loginDescription: 'Sign in to continue to FlowPilot.',
    loggingIn: 'Signing in...',
  },

  navigation: {
    dashboard: 'Dashboard',
    members: 'Members',
    invitations: 'Invitations',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
  },

  languageSwitcher: {
    label: 'Language',
  },
};
