import { createBrowserRouter } from 'react-router';

import { AcceptInvitationPage } from '../features/invitations/AcceptInvitationPage';

export const router = createBrowserRouter([
  {
    path: '/invitations/:invitationId/accept',
    Component: AcceptInvitationPage,
  },
]);
