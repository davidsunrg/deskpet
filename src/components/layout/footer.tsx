'use client';

import { m } from '@/locale/paraglide/messages';
import { useFooterLinks } from '@/config/footer-config';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { Logo } from '@/components/shared/logo';
import { Link, useLocation } from '@tanstack/react-router';
import { websiteConfig } from '@/config/website';
import { useTranslations } from '@/lib/deskpet-i18n';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const pathname = useLocation().pathname;
  const footerLinks = useFooterLinks();
  const t = useTranslations('Marketing.footer');

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-6">
          <div className="col-span-full flex flex-col items-start md:col-span-2">
            <div className="flex items-center space-x-2">
              <Logo />
              <span className="text-xl font-semibold">
                {websiteConfig.metadata?.name}
              </span>
            </div>
          </div>

          {footerLinks?.map((section) => (
            <div
              key={section.title}
              className="col-span-1 md:col-span-1 flex flex-col items-start"
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
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
                          >
                            {item.title}
                          </a>
                        ) : (
                          <Link
                            to={item.href}
                            data-active={
                              item.href.includes('#')
                                ? undefined
                                : isLinkActive(item.href, pathname)
                                  ? 'true'
                                  : undefined
                            }
                            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-primary focus-visible:text-primary data-[active=true]:font-semibold data-[active=true]:text-primary"
                          >
                            {item.title}
                          </Link>
                        )}
                      </li>
                    )
                )}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="border-t py-8">
        <Container className="flex flex-col items-start gap-2 px-4 text-left">
          <p className="max-w-md text-base text-muted-foreground">
            {t('tagline')}
          </p>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {websiteConfig.metadata?.name}.{' '}
            {m.footer_rights_reserved()}
          </span>
        </Container>
      </div>
    </footer>
  );
}
