import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { CustomPetFinalPricingCard } from '@/components/dashboard/custom-pet-final-pricing-card';
import { CustomPetLimitedOfferBanner } from '@/components/dashboard/custom-pet-limited-offer-banner';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { CheckCircle2Icon } from 'lucide-react';

type DashboardPetDetailFinalStepProps = {
  isPaid: boolean;
  checkoutBusy: boolean;
  onJoinQueue: () => void | Promise<void>;
};

export function DashboardPetDetailFinalStep({
  isPaid,
  checkoutBusy,
  onJoinQueue,
}: DashboardPetDetailFinalStepProps) {
  const t = useTranslations('DashboardPetDetail');

  return (
    <section
      className={cn(
        dashboardCardClass,
        'flex min-h-0 flex-1 flex-col p-5 sm:p-6'
      )}
    >
      <DashboardCardHeader
        icon={<CheckCircle2Icon className="size-[18px]" />}
        accent="bg-deskpet-mint-soft"
        title={t('final.title')}
        description={t('final.description')}
      />
      {isPaid ? (
        <div className="mt-2 rounded-2xl border-2 border-deskpet-mint bg-deskpet-mint-soft/40 p-5">
          <p className="m-0 text-lg font-black text-deskpet-ink">
            {t('final.paidTitle')}
          </p>
          <p className="mt-2 m-0 text-sm leading-6 text-deskpet-muted">
            {t('final.paidDescription')}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex w-full max-w-md flex-col gap-3">
            <CustomPetLimitedOfferBanner />
            <CustomPetFinalPricingCard
              busy={checkoutBusy}
              onJoinQueue={onJoinQueue}
            />
          </div>
        </div>
      )}
    </section>
  );
}
