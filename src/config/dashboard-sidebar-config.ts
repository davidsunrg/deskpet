'use client';

import { Routes } from '@/lib/routes';
import type { SessionUser } from '@/auth/types';
import type { MenuItemConfig } from '@/types';

export function getDashboardSidebarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'My Pets',
      href: Routes.DashboardPets,
      external: false,
    },
  ];
}

export function getDashboardSidebarLinksForUser(
  _user?: SessionUser | null
): MenuItemConfig[] {
  return getDashboardSidebarLinks();
}
