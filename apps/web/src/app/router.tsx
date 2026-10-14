import { createBrowserRouter } from 'react-router';

import { AcceptInvitationPage } from '../pages/invitations/AcceptInvitationPage';
import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { MembersPage } from '../pages/members/MembersPage';
import { InvitationsPage } from '../pages/invitations/InvitationsPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        Component: HomePage,
      },
      {
        path: '/invitations/:invitationId/accept',
        Component: AcceptInvitationPage,
      },
      {
        path: '/login',
        Component: LoginPage,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          {
            index: true,
            Component: DashboardPage,
          },
          {
            path: 'members',
            Component: MembersPage,
          },
          {
            path: 'invitations',
            Component: InvitationsPage,
          },
        ],
      },
    ],
  },
]);
