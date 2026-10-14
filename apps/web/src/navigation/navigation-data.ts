import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Mail, Users } from 'lucide-react';

export type NavigationItem = {
  id: string;
  labelKey: string;
  path?: string;
  icon: LucideIcon;
  children?: NavigationItem[];
};

export const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    labelKey: 'navigation.dashboard',
    path: '/app',
    icon: LayoutDashboard,
  },
  {
    id: 'members',
    labelKey: 'navigation.members',
    path: '/app/members',
    icon: Users,
  },
  {
    id: 'invitations',
    labelKey: 'navigation.invitations',
    path: '/app/invitations',
    icon: Mail,
  },
];
