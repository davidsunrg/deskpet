'use client';

import Container from '@/components/layout/container';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { FilmIcon, PawPrintIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const TOOL_NAV_ITEMS = [
  {
    id: 'desktopPetMaker',
    href: Routes.DesktopPetCreator,
    icon: PawPrintIcon,
  },
  {
    id: 'petVideoMaker',
    href: Routes.PetVideoCreator,
    icon: FilmIcon,
  },
] as const;

type MarketingToolsShellProps = {
  children: ReactNode;
};

function isToolActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingToolsShell({ children }: MarketingToolsShellProps) {
  const t = useTranslations('MarketingTools');
  const pathname = useLocalePathname();

  return (
    <Container className="px-4 py-10 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          aria-label={t('navLabel')}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border-2 lg:border-deskpet-ink/10 lg:bg-deskpet-paper lg:p-2 lg:pb-2 lg:shadow-[4px_4px_0_0_rgba(55,39,51,0.08)] [&::-webkit-scrollbar]:hidden">
            {TOOL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isToolActive(pathname, item.href);
              return (
                <LocaleLink
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm font-black transition-colors lg:w-full lg:rounded-xl',
                    active
                      ? 'border-deskpet-ink bg-deskpet-mint text-[#133e31] shadow-[2px_2px_0_0_rgba(55,39,51,0.12)]'
                      : 'border-deskpet-ink/15 bg-white text-deskpet-ink hover:border-deskpet-ink hover:bg-deskpet-mint-soft'
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">
                    {t(`items.${item.id}`)}
                  </span>
                </LocaleLink>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
