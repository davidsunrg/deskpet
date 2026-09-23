import { createFileRoute, redirect } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/studio/public-site/')({
  beforeLoad: () => {
    throw redirect({ to: Routes.StudioPublicSiteEditor });
  },
});
