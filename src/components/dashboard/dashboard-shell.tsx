import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { SessionUser } from '@/auth/types';
import type { PropsWithChildren } from 'react';

type DashboardShellProps = PropsWithChildren<{
  user: SessionUser;
}>;

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '252px',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
