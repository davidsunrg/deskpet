import { createFileRoute, redirect } from '@tanstack/react-router';
import { Routes } from '@/lib/routes';

export const Route = createFileRoute('/auth/register')({
  beforeLoad: ({ location }) => {
    throw redirect({
      to: Routes.Signup,
      search: location.search,
    });
  },
});
