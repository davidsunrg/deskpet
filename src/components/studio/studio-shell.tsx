import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';
import { StudioSidebar } from './studio-sidebar';

/**
 * Copy of `DashboardShell` for the studio section — same shell, tokens and
 * style as /dashboard, without touching dashboard code.
 */
export function StudioShell({ children }: PropsWithChildren) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '252px',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <StudioSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
