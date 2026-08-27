'use client';

import { m } from '@/locale/paraglide/messages';
import { useFooterLinks } from '@/config/footer-config';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getCanonicalPathname } from '@/lib/locale';
import { isLocalePathActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { BrandName } from '@/components/layout/brand-name';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { Logo } from '@/components/layout/logo';
import { websiteConfig } from '@/config/website';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const localePathname = getCanonicalPathname(useLocalePathname());
  const footerLinks = useFooterLinks();
  const t = useTranslations('Marketing.footer');

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 pt-16 pb-8 md:grid-cols-6">
          <div className="col-span-full flex flex-col items-start md:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Logo />
                <BrandName className="text-xl" />
              </div>

              <p className="py-2 text-base text-muted-foreground md:pr-12">
                {t('tagline')}
              </p>

              <LocaleSwitcher />
            </div>
          </div>

          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 items-start md:col-span-1"
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
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={
                            item.external ? 'noopener noreferrer' : undefined
                          }
                          className={cn(
                            'text-sm text-deskpet-muted transition-colors duration-150 hover:text-deskpet-ink',
                            !item.external &&
                              !item.href.includes('#') &&
                              isLocalePathActive(item.href, localePathname) &&
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

      <div className="pt-0 pb-8">
        <Container className="flex items-center justify-center px-4">
          <span className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}.{' '}
            {m.footer_rights_reserved()}
          </span>
        </Container>
      </div>
    </footer>
  );
}
