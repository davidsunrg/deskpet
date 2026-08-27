import {
  DashboardHeader,
  type DashboardBreadcrumbItem,
} from '@/components/layout/dashboard-header';
import type { ReactNode } from 'react';

export type DashboardPageShellProps = {
  breadcrumbs: DashboardBreadcrumbItem[];
  leading?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function DashboardPageShell({
  breadcrumbs,
  leading,
  actions,
  children,
}: DashboardPageShellProps) {
  const hasToolbar = Boolean(leading || actions);

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="@container/main flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6">
              {hasToolbar ? (
                <div className="flex shrink-0 items-center gap-3">
                  {leading ? (
                    <div className="flex shrink-0 items-center">{leading}</div>
                  ) : null}
                  {actions ? (
                    <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                      {actions}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
