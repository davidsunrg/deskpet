import type { ReactNode } from 'react';
import { StudioHeader, type StudioBreadcrumbItem } from './studio-header';

export type StudioPageShellProps = {
  breadcrumbs: StudioBreadcrumbItem[];
  leading?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

/**
 * Copy of `DashboardPageShell` for the studio section.
 */
export function StudioPageShell({
  breadcrumbs,
  leading,
  actions,
  children,
}: StudioPageShellProps) {
  const hasToolbar = Boolean(leading || actions);

  return (
    <>
      <StudioHeader breadcrumbs={breadcrumbs} />
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
