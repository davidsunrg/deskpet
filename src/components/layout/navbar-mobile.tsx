'use client';

import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/layout/logo';
import { MarketingLoginButton } from '@/components/auth/marketing-login-button';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useNavbarLinks } from '@/config/navbar-config';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { cn } from '@/utils/cn';
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const mobileLinkClass =
  'flex w-full items-center rounded-md p-2 text-[15px] font-bold text-deskpet-muted transition-colors duration-150 hover:bg-deskpet-mint-soft hover:text-deskpet-ink';
const mobileLinkActiveClass = 'font-bold text-deskpet-ink bg-deskpet-mint-soft';
const mobileSubLinkClass =
  'flex w-full items-center gap-4 rounded-md p-2 text-[15px] font-bold text-deskpet-muted transition-colors duration-150 hover:bg-deskpet-mint-soft hover:text-deskpet-ink';

interface NavbarMobileProps extends React.HTMLAttributes<HTMLDivElement> {
  initialNavSignedIn?: boolean;
}

export function NavbarMobile({
  className,
  initialNavSignedIn = false,
  ...props
}: NavbarMobileProps) {
  const localePathname = useLocalePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuLinks = useNavbarLinks();
  // Sync mount (drawer only) and close drawer on route change
  useEffect(() => {
    setMounted(true);
    setOpen(false);
  }, [localePathname]);

  return (
    <>
      {/* h-14 + header border-b keeps the row aligned with the drawer's top-14.25 offset */}
      <div
        className={cn(
          'flex h-14 items-center justify-between gap-3',
          className
        )}
        {...props}
      >
        <LocaleLink
          href="/"
          aria-label="Home"
          className="flex min-w-0 items-center gap-2"
        >
          <Logo className="size-8 rounded-lg" />
          <BrandName className="whitespace-nowrap text-xl" />
        </LocaleLink>

        <div className="flex shrink-0 items-center gap-2">
          <MarketingLoginButton initialIsSignedIn={initialNavSignedIn} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="size-8 rounded-md border"
          >
            {open ? (
              <XIcon className="size-4" />
            ) : (
              <MenuIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {mounted && open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 top-14.25 z-50 flex flex-col overflow-y-auto bg-background animate-in fade-in-0 duration-200"
        >
          <div className="flex flex-1 flex-col items-start gap-4 p-4">
            <ul className="w-full space-y-1">
              {menuLinks?.map((item) => {
                const active = item.href
                  ? item.href === '/'
                    ? localePathname === '/'
                    : localePathname.startsWith(item.href)
                  : item.items?.some(
                      (sub) => sub.href && localePathname.startsWith(sub.href)
                    );

                return (
                  <li key={item.title} className="py-1">
                    {item.items ? (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className={cn(
                              'w-full justify-between text-left text-[15px] font-bold',
                              'bg-transparent text-deskpet-muted hover:bg-deskpet-mint-soft hover:text-deskpet-ink',
                              active &&
                                'bg-deskpet-mint-soft font-bold text-deskpet-ink'
                            )}
                          >
                            {item.title}
                            <ChevronRightIcon className="size-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-2">
                          <ul className="mt-2 space-y-2">
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
                                    mobileSubLinkClass,
                                    sub.href &&
                                      localePathname.startsWith(sub.href) &&
                                      mobileLinkActiveClass
                                  )}
                                >
                                  {sub.icon ? (
                                    <div className="size-4 shrink-0">
                                      {sub.icon}
                                    </div>
                                  ) : null}
                                  {sub.title}
                                  {sub.external ? (
                                    <ArrowUpRightIcon className="size-4 shrink-0" />
                                  ) : null}
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
                          mobileLinkClass,
                          active && mobileLinkActiveClass
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
