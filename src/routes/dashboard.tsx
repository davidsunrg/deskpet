import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { authClient } from '@/auth/client';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { Spinner } from '@/components/ui/spinner';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
});

function DashboardLayoutPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();

  if (sessionPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <DashboardShell user={session.user}>
      <Outlet />
    </DashboardShell>
  );
}
