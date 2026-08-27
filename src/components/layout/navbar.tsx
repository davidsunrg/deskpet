import { m } from '@/locale/paraglide/messages';
import { useNavbarLinks } from '@/config/navbar-config';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getCanonicalPathname } from '@/lib/locale';
import { isLinkActive } from '@/lib/urls';
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
import { IconChevronDown } from '@tabler/icons-react';
import { websiteConfig } from '@/config/website';

interface NavbarProps {
  identity: MarketingNavbarIdentity;
}

export function Navbar({ identity }: NavbarProps) {
  const pathname = getCanonicalPathname(useLocalePathname());
  const menuLinks = useNavbarLinks();
  const showAuth =
    websiteConfig.auth?.enable && websiteConfig.auth.enableNavbarLogin;
  const signedIn = !!identity.user;

  return (
    <header className="sticky inset-x-0 top-0 z-40 min-h-[84px] border-b border-[rgba(56,42,53,0.1)] bg-deskpet-paper">
      <Container className="px-4">
        <nav
          aria-label={m.common_main_navigation()}
          className="hidden min-h-[84px] items-center justify-between gap-8 lg:flex"
        >
          <LocaleLink
            href="/"
            aria-label={m.common_home()}
            className="flex shrink-0 items-center gap-3"
          >
            <Logo />
            <BrandName className="text-[1.35rem]" />
          </LocaleLink>

          <ul className="flex flex-1 items-center justify-center gap-6">
            {menuLinks?.map((item) => {
              if (item.items) {
                const active = item.items.some((sub) =>
                  isLinkActive(sub.href, pathname)
                );
                return (
                  <li key={item.title}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          desktopNavLinkClass(active),
                          'cursor-pointer border-0 bg-transparent outline-none'
                        )}
                      >
                        {item.title}
                        <IconChevronDown className="size-4 opacity-70" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        className="min-w-56 rounded-xl border-deskpet-ink/10 bg-deskpet-paper p-2 shadow-lg"
                      >
                        {item.items.map((sub) => (
                          <LocaleLink
                            key={sub.title}
                            href={sub.href ?? '#'}
                            target={sub.external ? '_blank' : undefined}
                            rel={
                              sub.external ? 'noopener noreferrer' : undefined
                            }
                            className="block"
                          >
                            <DropdownMenuItem className="rounded-lg px-3 py-2 text-sm font-bold text-deskpet-ink focus:bg-deskpet-mint-soft">
                              {sub.title}
                            </DropdownMenuItem>
                          </LocaleLink>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              }

              const active = isLinkActive(item.href, pathname);
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
            <div className="flex shrink-0 items-center">
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
    </header>
  );
}
