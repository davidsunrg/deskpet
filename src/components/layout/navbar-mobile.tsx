import { m } from '@/locale/paraglide/messages';
import { useNavbarLinks } from '@/config/navbar-config';
import { isLinkActive } from '@/lib/urls';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Link, useLocation } from '@tanstack/react-router';
import { IconChevronRight, IconMenu2, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shared/logo';
import { MarketingLoginButton } from '@/components/auth/marketing-login-button';
import { MarketingUserButton } from '@/components/auth/marketing-user-button';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import type { MarketingNavbarIdentity } from '@/lib/auth/marketing-identity';
import { websiteConfig } from '@/config/website';

const mobileLinkClass =
  'flex h-8 w-full items-center rounded-lg px-2.5 text-base text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground';
const mobileLinkActiveClass = 'bg-muted font-semibold text-foreground';
const mobileSubLinkClass =
  'flex w-full items-center gap-4 rounded-md p-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground';

interface NavbarMobileProps extends React.HTMLAttributes<HTMLDivElement> {
  identity: MarketingNavbarIdentity;
}

export function NavbarMobile({
  className,
  identity,
  ...props
}: NavbarMobileProps) {
  const pathname = useLocation().pathname;
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
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-semibold">
            {websiteConfig.metadata?.name}
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {showAuth && signedIn ? (
            <MarketingUserButton identity={identity} />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label={m.common_toggle_menu()}
            onClick={() => setOpen((value) => !value)}
            className="size-8 rounded-md border"
          >
            {open ? (
              <IconX className="size-4" />
            ) : (
              <IconMenu2 className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={m.common_mobile_navigation()}
          className="fixed inset-0 top-14.25 z-50 flex flex-col overflow-y-auto bg-background animate-in fade-in-0 duration-200 lg:hidden"
        >
          <div className="flex flex-1 flex-col items-start gap-4 p-4">
            {showAuth && !signedIn ? (
              <div className="flex w-full flex-col gap-3">
                <MarketingLoginButton className="w-full" variant="outline" />
                <LoginWrapper mode="modal" initialView="signup" asChild>
                  <button
                    type="button"
                    className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                    onClick={() => setOpen(false)}
                  >
                    {m.auth_common_signup()}
                  </button>
                </LoginWrapper>
              </div>
            ) : null}

            <ul className="w-full space-y-1">
              {menuLinks?.map((item) => {
                const active = item.href
                  ? isLinkActive(item.href, pathname)
                  : item.items?.some((sub) => isLinkActive(sub.href, pathname));
                return (
                  <li key={item.title} className="py-1">
                    {item.items ? (
                      <Collapsible>
                        <CollapsibleTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              className={cn(
                                mobileLinkClass,
                                'justify-between bg-transparent text-left',
                                active && mobileLinkActiveClass
                              )}
                            >
                              {item.title}
                              <IconChevronRight className="size-4" />
                            </Button>
                          }
                          nativeButton={false}
                        />
                        <CollapsibleContent className="pl-2">
                          <ul className="mt-2 space-y-2">
                            {item.items.map((sub) => (
                              <li key={sub.title}>
                                <Link
                                  to={sub.href ?? '#'}
                                  target={sub.external ? '_blank' : undefined}
                                  rel={
                                    sub.external
                                      ? 'noopener noreferrer'
                                      : undefined
                                  }
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    mobileSubLinkClass,
                                    isLinkActive(sub.href, pathname) &&
                                      mobileLinkActiveClass
                                  )}
                                >
                                  {sub.icon ? (
                                    <sub.icon className="size-4 shrink-0" />
                                  ) : null}
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        to={item.href ?? '#'}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          mobileLinkClass,
                          active && mobileLinkActiveClass
                        )}
                      >
                        {item.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
