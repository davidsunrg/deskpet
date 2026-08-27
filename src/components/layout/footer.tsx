'use client';

import { BrandName } from '@/components/layout/brand-name';
import Container from '@/components/layout/container';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { Logo } from '@/components/layout/logo';
import { useFooterLinks } from '@/config/footer-config';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { useTranslations } from '@/lib/deskpet-i18n';
import type React from 'react';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const tFooter = useTranslations('Marketing.footer');
  const tMeta = useTranslations('Metadata');
  const footerLinks = useFooterLinks();
  const localePathname = useLocalePathname();

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 pt-16 pb-8 md:grid-cols-6">
          <div className="flex flex-col items-start col-span-full md:col-span-2">
            <div className="space-y-4">
              {/* logo and name */}
              <div className="items-center space-x-2 flex">
                <Logo />
                <BrandName className="text-xl" />
              </div>

              {/* tagline */}
              <p className="text-muted-foreground text-base py-2 md:pr-12">
                {tFooter('tagline')}
              </p>

              <LocaleSwitcher />
            </div>
          </div>

          {/* footer links */}
          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 md:col-span-1 items-start"
            >
              <span className="text-sm font-semibold uppercase">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        <LocaleLink
                          href={item.href || '#'}
                          target={item.external ? '_blank' : undefined}
                          className={cn(
                            'text-sm text-deskpet-muted transition-colors duration-150 hover:text-deskpet-ink',
                            !item.external &&
                              !item.href.includes('#') &&
                              (item.href === '/'
                                ? localePathname === '/'
                                : localePathname.startsWith(item.href)) &&
                              'font-semibold text-deskpet-ink'
                          )}
                        >
                          {item.title}
                        </LocaleLink>
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="pb-8 pt-0">
        <Container className="flex items-center justify-center px-4">
          <span className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {tMeta('name')}. All Rights
            Reserved.
          </span>
        </Container>
      </div>
    </footer>
  );
}
