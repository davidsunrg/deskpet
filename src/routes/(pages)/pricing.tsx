import { authClient } from '@/auth/client';
import { PricingTable } from '@/components/pricing/pricing-table';
import { useCurrentPlan } from '@/hooks/use-payment';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { isMarketingPricingEnabled } from '@/lib/marketing-pricing';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/pricing')({
  beforeLoad: () => {
    if (!isMarketingPricingEnabled()) {
      throw redirect({ to: Routes.Root });
    }
  },
  head: () =>
    seo('/pricing', {
      title: deskpetPageTitle(getDeskPetMessage('PricingPage.title')),
      description: getDeskPetMessage('PricingPage.description'),
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
