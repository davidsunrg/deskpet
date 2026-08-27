import { createFileRoute, Outlet } from '@tanstack/react-router';
import BackButtonSmall from '@/components/shared/back-button-small';

export const Route = createFileRoute('/auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-deskpet-paper p-6 pt-8 md:p-10">
      <BackButtonSmall className="absolute top-6 left-6" />
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <Outlet />
      </div>
    </div>
  );
}
