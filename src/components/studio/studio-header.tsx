import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ModeSwitcher } from '@/components/theme/mode-switcher';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { websiteConfig } from '@/config/website';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import React from 'react';

export interface StudioBreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface StudioHeaderProps {
  breadcrumbs: StudioBreadcrumbItem[];
  actions?: ReactNode;
}

/**
 * Copy of `DashboardHeader` for the studio section.
 */
export function StudioHeader({ breadcrumbs, actions }: StudioHeaderProps) {
  const showModeSwitch = websiteConfig.ui?.mode?.enableSwitch ?? false;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />

        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="text-base font-medium">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`breadcrumb-${index}`}>
                {index > 0 && (
                  <BreadcrumbSeparator
                    key={`sep-${index}`}
                    className="hidden md:block"
                  />
                )}
                <BreadcrumbItem
                  key={`item-${index}`}
                  className={
                    index < breadcrumbs.length - 1 ? 'hidden md:block' : ''
                  }
                >
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    item.label
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex shrink-0 items-center gap-3 pl-4">
          {actions}
          <LocaleSwitcher />
          {showModeSwitch && <ModeSwitcher />}
        </div>
      </div>
    </header>
  );
}
