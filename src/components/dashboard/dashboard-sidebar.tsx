'use client';

import { DashboardSidebarMain } from '@/components/dashboard/dashboard-sidebar-main';
import { SidebarUser } from '@/components/layout/sidebar-user';
import { BrandName } from '@/components/layout/brand-name';
import { Logo } from '@/components/shared/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { getDashboardSidebarLinksForUser } from '@/config/dashboard-sidebar-config';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/auth/types';
import type * as React from 'react';

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: SessionUser;
};

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const sidebarLinks = getDashboardSidebarLinksForUser(user);
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className={cn('border-r-0', props.className)}
    >
      <SidebarHeader className="gap-[10px] px-[18px] pt-[18px] pb-2">
        <LocaleLink
          href={Routes.Root}
          aria-label="Home"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className="flex items-center gap-2.5 px-[3px]"
        >
          <Logo className="size-8" />
          <BrandName className="text-xl" />
        </LocaleLink>
      </SidebarHeader>

      <SidebarContent className="px-[18px] pt-0">
        <DashboardSidebarMain items={sidebarLinks} user={user} />
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-[10px] px-[18px] pb-[22px]">
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
