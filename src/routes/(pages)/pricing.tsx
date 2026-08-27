import { m } from '@/locale/paraglide/messages';
import { authClient } from '@/auth/client';
import { PricingTable } from '@/components/pricing/pricing-table';
import { websiteConfig } from '@/config/website';
import { useCurrentPlan } from '@/hooks/use-payment';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  beforeLoad: () => {
    if (websiteConfig.payment?.enable === false) {
      throw redirect({ to: Routes.Root });
    }
  },
  head: () =>
    seo('/pricing', {
      title: `${m.pricing_page_title()} | ${websiteConfig.metadata?.name}`,
      description: m.pricing_page_description(),
    }),
  component: PricingPage,
});

function PricingPage() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const { data: planData } = useCurrentPlan(!!userId);
  const currentPlan = planData?.currentPlan ?? null;

  return (
    <PricingTable
      currentPlan={currentPlan}
      metadata={userId ? { userId } : undefined}
    />
  );
}
