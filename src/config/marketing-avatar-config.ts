import en from '@/i18n/deskpet/en.json';
import {
  IconLayoutDashboard,
  IconPhoto,
  IconReceipt2,
  IconStethoscope,
} from '@tabler/icons-react';
import { Routes } from '@/lib/routes';
import type { MenuItemConfig } from '../types';
import { getAvatarLinks } from './avatar-config';

const navbar = en.Marketing.navbar as {
  health: { title: string };
  expense: { title: string };
};

/**
 * DeskPet marketing account menu links.
 */
export function getMarketingAvatarLinks(): MenuItemConfig[] {
  return [
    {
      title: 'Actions',
      href: Routes.DashboardActions,
      icon: IconLayoutDashboard,
    },
    {
      title: 'Gallery',
      href: Routes.Pets,
      icon: IconPhoto,
    },
    {
      title: navbar.health.title,
      href: '/health',
      icon: IconStethoscope,
    },
    {
      title: navbar.expense.title,
      href: '/expense',
      icon: IconReceipt2,
    },
    ...getAvatarLinks().filter((item) => item.href === Routes.SettingsProfile),
  ];
}
