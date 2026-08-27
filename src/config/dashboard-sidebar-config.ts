'use client';

import { IconLayoutDashboard, IconMouse } from '@tabler/icons-react';
import { Routes } from '@/lib/routes';
import type { SessionUser } from '@/auth/types';
import type { MenuItemConfig } from '@/types';

export function getDashboardSidebarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'Play',
      items: [
        {
          title: 'Overview',
          icon: IconLayoutDashboard,
          href: Routes.DashboardOverview,
          external: false,
        },
        {
          title: 'Actions',
          icon: IconMouse,
          href: Routes.DashboardActions,
          external: false,
        },
      ],
    },
  ];
}

export function getDashboardSidebarLinksForUser(
  _user?: SessionUser | null
): MenuItemConfig[] {
  return getDashboardSidebarLinks();
}
