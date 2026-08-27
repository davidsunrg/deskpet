'use client';

import { Routes } from '@/lib/routes';
import { useTranslations } from '@/lib/deskpet-i18n';
import {
  DownloadIcon,
  HeartPulseIcon,
  NewspaperIcon,
  ReceiptTextIcon,
  TagIcon,
} from 'lucide-react';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * DeskPet navbar links (client — uses locale-aware DeskPet messages).
 */
export function useNavbarLinks(): MenuItemConfig[] {
  const t = useTranslations('Marketing.navbar');

  return [
    {
      title: t('pets.title'),
      href: Routes.Pets,
      external: false,
    },
    {
      title: t('playground.title'),
      href: Routes.Playground,
      external: false,
    },
    {
      title: t('makeMyOwn.title'),
      href: Routes.DesktopPetCreator,
      external: false,
    },
    {
      title: t('resources.title'),
      items: [
        {
          title: t('resources.items.download.title'),
          description: t('resources.items.download.description'),
          icon: <DownloadIcon className="size-4 shrink-0" />,
          href: Routes.Download,
          external: false,
        },
        {
          title: t('resources.items.health.title'),
          description: t('resources.items.health.description'),
          icon: <HeartPulseIcon className="size-4 shrink-0" />,
          href: Routes.Health,
          external: false,
        },
        {
          title: t('resources.items.expense.title'),
          description: t('resources.items.expense.description'),
          icon: <ReceiptTextIcon className="size-4 shrink-0" />,
          href: Routes.Expense,
          external: false,
        },
        ...(websiteConfig.payment?.enable
          ? [
              {
                title: t('resources.items.pricing.title'),
                description: t('resources.items.pricing.description'),
                icon: <TagIcon className="size-4 shrink-0" />,
                href: Routes.Pricing,
                external: false,
              },
            ]
          : []),
        ...(websiteConfig.blog?.enable
          ? [
              {
                title: t('resources.items.blog.title'),
                description: t('resources.items.blog.description'),
                icon: <NewspaperIcon className="size-4 shrink-0" />,
                href: Routes.Blog,
                external: false,
              },
            ]
          : []),
      ],
    },
  ];
}
