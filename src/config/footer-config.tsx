'use client';

import { Routes } from '@/lib/routes';
import { useTranslations } from '@/lib/deskpet-i18n';
import { isMarketingPricingEnabled } from '@/lib/marketing-pricing';
import type { MenuItemConfig } from '../types';
import { websiteConfig } from './website';

/**
 * DeskPet footer links (client — uses locale-aware DeskPet messages).
 */
export function useFooterLinks(): MenuItemConfig[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('product.title'),
      items: [
        {
          title: t('product.items.features'),
          href: Routes.Features,
          external: false,
        },
        ...(isMarketingPricingEnabled()
          ? [
              {
                title: t('product.items.pricing'),
                href: Routes.Pricing,
                external: false,
              },
            ]
          : []),
        {
          title: t('product.items.faq'),
          href: Routes.FAQ,
          external: false,
        },
      ],
    },
    {
      title: t('resources.title'),
      items: [
        {
          title: t('resources.items.petHub'),
          href: Routes.PetHub,
          external: false,
        },
        ...(websiteConfig.blog?.enable
          ? [
              {
                title: t('resources.items.blog'),
                href: Routes.Blog,
                external: false,
              },
            ]
          : []),
      ],
    },
    {
      title: t('company.title'),
      items: [
        {
          title: t('company.items.about'),
          href: Routes.About,
          external: false,
        },
        {
          title: t('company.items.contact'),
          href: Routes.Contact,
          external: false,
        },
      ],
    },
    {
      title: t('legal.title'),
      items: [
        {
          title: t('legal.items.cookiePolicy'),
          href: Routes.CookiePolicy,
          external: false,
        },
        {
          title: t('legal.items.privacyPolicy'),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t('legal.items.termsOfService'),
          href: Routes.TermsOfService,
          external: false,
        },
      ],
    },
  ];
}
