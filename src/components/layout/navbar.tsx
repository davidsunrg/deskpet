'use client';

import { BrandName } from '@/components/layout/brand-name';
import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { MarketingLoginButton } from '@/components/auth/marketing-login-button';
import { MarketingUserButton } from '@/components/auth/marketing-user-button';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavbarLinks } from '@/config/navbar-config';
import { websiteConfig } from '@/config/website';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import { ArrowUpRightIcon, ChevronDownIcon } from 'lucide-react';

interface NavBarProps {
  /** Kept for call-site compatibility; header always uses the HTML sticky style. */
  scroll?: boolean;
  /** Real signed-in identity from the server layout; null for guests/anonymous. */
  identity?: MarketingNavbarIdentity | null;
}

/** Matches references/html/pet-detail.html .nav-links a hover/active underline. */
const navLinkClass = cn(
  'relative inline-flex h-auto items-center gap-1 rounded-none bg-transparent px-0 py-2.5 text-[15px] font-bold text-deskpet-ink shadow-none',
  'hover:bg-transparent hover:text-deskpet-ink focus:bg-transparent focus:text-deskpet-ink',
  'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[3px] after:h-[3px]',
  'after:origin-center after:scale-x-0 after:rounded-full after:bg-deskpet-mint',
  'after:transition-transform after:duration-[160ms] after:ease-out',
  'hover:after:scale-x-100',
  'data-[state=open]:after:scale-x-100'
);

const navLinkActiveClass = 'after:scale-x-100';

export function Navbar({ identity = null }: NavBarProps = {}) {
  const menuLinks = useNavbarLinks();
  const localePathname = useLocalePathname();
  const showNavbarLogin =
    websiteConfig.auth?.enable && websiteConfig.auth.enableNavbarLogin;
  const authControl = showNavbarLogin ? (
    identity ? (
      <MarketingUserButton identity={identity} />
    ) : (
      <MarketingLoginButton mode="modal" />
    )
  ) : null;

  return (
    <header
      className={cn(
        /* references/html/pet-detail.html .site-header — solid paper, no translucency */
        'sticky inset-x-0 top-0 z-40 border-b border-[rgba(56,42,53,0.1)]',
        'bg-deskpet-paper dark:border-border dark:bg-background'
      )}
    >
      <div className="relative z-10">
        <Container className="px-4">
          {/* desktop navbar */}
          <nav
            aria-label="Main navigation"
            className="hidden min-h-[84px] lg:flex lg:items-center lg:justify-between lg:gap-6"
          >
            <LocaleLink
              href="/"
              aria-label="Home"
              className="flex items-center gap-3 shrink-0"
            >
              <Logo />
              <BrandName />
            </LocaleLink>

            <ul className="flex flex-1 list-none items-center justify-center gap-[26px]">
              {menuLinks?.map((item) => {
                if (item.items) {
                  const childActive = item.items.some((sub) =>
                    sub.href ? localePathname.startsWith(sub.href) : false
                  );

                  return (
                    <li key={item.title}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            navLinkClass,
                            'group outline-none',
                            childActive && navLinkActiveClass
                          )}
                        >
                          {item.title}
                          <ChevronDownIcon
                            className="relative top-px size-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                          />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          sideOffset={10}
                          className="min-w-64 p-2"
                        >
                          {item.items.map((sub) => {
                            const isSubActive =
                              !!sub.href && localePathname.startsWith(sub.href);

                            return (
                              <DropdownMenuItem
                                key={sub.title}
                                asChild
                                className={cn(
                                  'cursor-pointer gap-3 rounded-md p-2',
                                  'focus:bg-deskpet-mint-soft focus:text-deskpet-ink',
                                  isSubActive &&
                                    'bg-deskpet-mint-soft font-bold text-deskpet-ink'
                                )}
                              >
                                <LocaleLink
                                  href={sub.href ?? '#'}
                                  target={sub.external ? '_blank' : undefined}
                                  rel={
                                    sub.external
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
                                >
                                  {sub.icon ? (
                                    <span className="size-4 shrink-0">
                                      {sub.icon}
                                    </span>
                                  ) : null}
                                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-sm font-medium">
                                      {sub.title}
                                    </span>
                                    {sub.description ? (
                                      <span className="text-xs font-normal text-muted-foreground whitespace-normal">
                                        {sub.description}
                                      </span>
                                    ) : null}
                                  </span>
                                  {sub.external ? (
                                    <ArrowUpRightIcon className="size-4 shrink-0" />
                                  ) : null}
                                </LocaleLink>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                }

                const active =
                  !!item.href &&
                  (item.href === '/'
                    ? localePathname === '/'
                    : localePathname.startsWith(item.href));

                return (
                  <li key={item.title}>
                    <LocaleLink
                      href={item.href || '#'}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className={cn(navLinkClass, active && navLinkActiveClass)}
                    >
                      {item.title}
                    </LocaleLink>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-4 shrink-0">
              {authControl}
            </div>
          </nav>

          {/* mobile navbar */}
          <NavbarMobile className="lg:hidden" identity={identity} />
        </Container>
      </div>
    </header>
  );
}
