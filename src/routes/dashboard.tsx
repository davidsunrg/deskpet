import { AdoptPetRequiredEmpty } from '@/components/dashboard/adopt-pet-required-empty';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { listUserPetsForCurrentUser } from '@/api/pets';
import { authClient } from '@/auth/client';
import { authRouteMiddleware } from '@/middlewares/auth-middleware';
import { Spinner } from '@/components/ui/spinner';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/dashboard')({
  ssr: false,
  component: DashboardLayoutPage,
  server: {
    middleware: [authRouteMiddleware],
  },
});

function DashboardLayoutPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const {
    data: pets = [],
    isPending: petsPending,
    isError,
  } = useQuery({
    queryKey: ['user-pets', session?.user?.id],
    queryFn: () => listUserPetsForCurrentUser(),
    enabled: !!session?.user,
  });

  if (sessionPending || petsPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (isError) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Failed to load your pets. Refresh and try again.
      </div>
    );
  }

  if (pets.length === 0) {
    return <AdoptPetRequiredEmpty />;
  }

  return (
    <DashboardShell user={session.user} pets={pets}>
      <Outlet />
    </DashboardShell>
  );
}
