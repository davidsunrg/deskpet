import { m } from '@/locale/paraglide/messages';
import { useNavbarLinks } from '@/config/navbar-config';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getCanonicalPathname } from '@/lib/locale';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/layout/logo';
import {
  mobileNavLinkActiveClass,
  mobileNavLinkClass,
  mobileNavSubLinkClass,
} from '@/components/layout/navbar-link-styles';
import { MarketingLoginButton } from '@/components/auth/marketing-login-button';
import { MarketingUserButton } from '@/components/auth/marketing-user-button';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import { IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { websiteConfig } from '@/config/website';

interface NavbarMobileProps extends React.HTMLAttributes<HTMLDivElement> {
  identity: MarketingNavbarIdentity;
}

export function NavbarMobile({
  className,
  identity,
  ...props
}: NavbarMobileProps) {
  const pathname = getCanonicalPathname(useLocalePathname());
  const [open, setOpen] = useState(false);
  const menuLinks = useNavbarLinks();
  const showAuth =
    websiteConfig.auth?.enable && websiteConfig.auth.enableNavbarLogin;
  const signedIn = !!identity.user;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div
        className={cn('flex h-14 items-center justify-between', className)}
        {...props}
      >
        <LocaleLink href="/" className="flex min-w-0 items-center gap-2.5">
          <Logo className="size-8 rounded-lg" />
          <BrandName className="text-lg" />
        </LocaleLink>

        <div className="flex items-center gap-2">
          {showAuth ? (
            signedIn ? (
              <MarketingUserButton identity={identity} />
            ) : (
              <MarketingLoginButton />
            )
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label={m.common_toggle_menu()}
            onClick={() => setOpen((value) => !value)}
            className="size-9 rounded-lg border border-deskpet-ink/15 text-deskpet-ink"
          >
            {open ? (
              <IconX className="size-4" />
            ) : (
              <IconMenu2 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={m.common_mobile_navigation()}
          className="fixed inset-0 top-14.25 z-50 flex flex-col overflow-y-auto bg-deskpet-paper animate-in fade-in-0 duration-200 lg:hidden"
        >
          <div className="flex flex-1 flex-col gap-2 p-4">
            <ul className="w-full space-y-1">
              {menuLinks?.map((item) => {
                const active = item.href
                  ? isLinkActive(item.href, pathname)
                  : item.items?.some((sub) => isLinkActive(sub.href, pathname));
                return (
                  <li key={item.title}>
                    {item.items ? (
                      <Collapsible>
                        <CollapsibleTrigger
                          className={cn(
                            mobileNavLinkClass,
                            'w-full justify-between',
                            active && mobileNavLinkActiveClass
                          )}
                        >
                          {item.title}
                          <IconChevronRight className="size-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-2">
                          <ul className="mt-1 space-y-1">
                            {item.items.map((sub) => (
                              <li key={sub.title}>
                                <LocaleLink
                                  href={sub.href ?? '#'}
                                  target={sub.external ? '_blank' : undefined}
                                  rel={
                                    sub.external
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    mobileNavSubLinkClass,
                                    isLinkActive(sub.href, pathname) &&
                                      mobileNavLinkActiveClass
                                  )}
                                >
                                  {sub.icon ? (
                                    <sub.icon className="size-4 shrink-0" />
                                  ) : null}
                                  {sub.title}
                                </LocaleLink>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <LocaleLink
                        href={item.href ?? '#'}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          mobileNavLinkClass,
                          active && mobileNavLinkActiveClass
                        )}
                      >
                        {item.title}
                      </LocaleLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
