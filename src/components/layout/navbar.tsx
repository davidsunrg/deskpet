import { m } from '@/locale/paraglide/messages';
import { useNavbarLinks } from '@/config/navbar-config';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getCanonicalPathname } from '@/lib/locale';
import { isLocalePathActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import Container from '@/components/layout/container';
import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/layout/logo';
import { desktopNavLinkClass } from '@/components/layout/navbar-link-styles';
import { NavbarMobile } from '@/components/layout/navbar-mobile';
import { MarketingLoginButton } from '@/components/auth/marketing-login-button';
import { MarketingUserButton } from '@/components/auth/marketing-user-button';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { websiteConfig } from '@/config/website';
import { IconArrowUpRight, IconChevronDown } from '@tabler/icons-react';

interface NavbarProps {
  identity: MarketingNavbarIdentity;
}

export function Navbar({ identity }: NavbarProps) {
  const localePathname = getCanonicalPathname(useLocalePathname());
  const menuLinks = useNavbarLinks();
  const showAuth =
    websiteConfig.auth?.enable && websiteConfig.auth.enableNavbarLogin;
  const signedIn = !!identity.user;

  return (
    <header className="sticky inset-x-0 top-0 z-40 border-b border-[rgba(56,42,53,0.1)] bg-deskpet-paper dark:border-border dark:bg-background">
      <div className="relative z-10">
        <Container className="px-4">
          <nav
            aria-label={m.common_main_navigation()}
            className="hidden min-h-[84px] lg:flex lg:items-center lg:justify-between lg:gap-6"
          >
            <LocaleLink
              href="/"
              aria-label={m.common_home()}
              className="flex shrink-0 items-center gap-3"
            >
              <Logo />
              <BrandName />
            </LocaleLink>

            <ul className="flex flex-1 list-none items-center justify-center gap-[26px]">
              {menuLinks?.map((item) => {
                if (item.items) {
                  const childActive = item.items.some((sub) =>
                    isLocalePathActive(sub.href, localePathname)
                  );

                  return (
                    <li key={item.title}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            desktopNavLinkClass(childActive),
                            'group cursor-pointer outline-none'
                          )}
                        >
                          {item.title}
                          <IconChevronDown
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
                            const isSubActive = isLocalePathActive(
                              sub.href,
                              localePathname
                            );

                            return (
                              <DropdownMenuItem
                                key={sub.title}
                                className={cn(
                                  'cursor-pointer gap-3 rounded-md p-2',
                                  'focus:bg-deskpet-mint-soft focus:text-deskpet-ink',
                                  isSubActive &&
                                    'bg-deskpet-mint-soft font-bold text-deskpet-ink'
                                )}
                                render={
                                  <LocaleLink
                                    href={sub.href ?? '#'}
                                    target={sub.external ? '_blank' : undefined}
                                    rel={
                                      sub.external
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                  />
                                }
                              >
                                {sub.icon ? (
                                  <sub.icon className="size-4 shrink-0" />
                                ) : null}
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                  <span className="text-sm font-medium">
                                    {sub.title}
                                  </span>
                                  {sub.description ? (
                                    <span className="text-xs font-normal whitespace-normal text-muted-foreground">
                                      {sub.description}
                                    </span>
                                  ) : null}
                                </span>
                                {sub.external ? (
                                  <IconArrowUpRight className="size-4 shrink-0" />
                                ) : null}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                }

                const active = isLocalePathActive(item.href, localePathname);

                return (
                  <li key={item.title}>
                    <LocaleLink
                      href={item.href ?? '#'}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className={desktopNavLinkClass(active)}
                    >
                      {item.title}
                    </LocaleLink>
                  </li>
                );
              })}
            </ul>

            {showAuth ? (
              <div className="flex shrink-0 items-center gap-4">
                {signedIn ? (
                  <MarketingUserButton identity={identity} />
                ) : (
                  <MarketingLoginButton />
                )}
              </div>
            ) : null}
          </nav>

          <NavbarMobile className="lg:hidden" identity={identity} />
        </Container>
      </div>
    </header>
  );
}
