'use client';

import { m } from '@/locale/paraglide/messages';
import { useFooterLinks } from '@/config/footer-config';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getCanonicalPathname } from '@/lib/locale';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { BrandName } from '@/components/layout/brand-name';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { Logo } from '@/components/layout/logo';
import { websiteConfig } from '@/config/website';

const footerLinkClass =
  'text-sm text-deskpet-muted transition-colors hover:text-deskpet-ink';

const footerLinkActiveClass = 'font-semibold text-deskpet-ink';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = getCanonicalPathname(useLocalePathname());
  const footerLinks = useFooterLinks();
  const t = useTranslations('Marketing.footer');

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 pt-16 pb-8 md:grid-cols-6">
          <div className="col-span-2 flex flex-col items-start">
            <LocaleLink href="/" className="flex items-center gap-3">
              <Logo />
              <BrandName className="text-xl" />
            </LocaleLink>
            <p className="py-2 text-base text-muted-foreground md:pr-12">
              {t('tagline')}
            </p>
            <LocaleSwitcher />
          </div>

          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 flex flex-col items-start"
            >
              <span className="text-sm font-semibold uppercase">
                {section.title}
              </span>
              <ul className="mt-4 list-inside space-y-3">
                {section.items?.map(
                  (item) =>
                    item.href && (
                      <li key={item.title}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={footerLinkClass}
                          >
                            {item.title}
                          </a>
                        ) : (
                          <LocaleLink
                            href={item.href}
                            className={cn(
                              footerLinkClass,
                              !item.href.includes('#') &&
                                isLinkActive(item.href, pathname) &&
                                footerLinkActiveClass
                            )}
                          >
                            {item.title}
                          </LocaleLink>
                        )}
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>

        <p className="pb-8 text-center text-sm text-deskpet-muted">
          &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}.{' '}
          {m.footer_rights_reserved()}
        </p>
      </Container>
    </footer>
  );
}
