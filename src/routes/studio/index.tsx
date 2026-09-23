import { StudioDashboard } from '@/components/studio/studio-dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/studio/')({
  component: StudioDashboard,
});
