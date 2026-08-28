import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { CustomPetFinalPricingCard } from '@/components/dashboard/custom-pet-final-pricing-card';
import { CustomPetLimitedOfferBanner } from '@/components/dashboard/custom-pet-limited-offer-banner';
import { useTranslations } from '@/lib/deskpet-i18n';
import { formatDateTime } from '@/lib/formatter';
import { cn } from '@/lib/utils';
import { CheckCircle2Icon } from 'lucide-react';

const SUPPORT_EMAIL = 'david@deskpet.ai';

type DashboardPetDetailFinalStepProps = {
  isPaid: boolean;
  deliveryAt?: Date | string | null;
  userEmail?: string | null;
  checkoutBusy: boolean;
  onJoinQueue: () => void | Promise<void>;
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function DashboardPetDetailFinalStep({
  isPaid,
  deliveryAt,
  userEmail,
  checkoutBusy,
  onJoinQueue,
}: DashboardPetDetailFinalStepProps) {
  const t = useTranslations('DashboardPetDetail');
  const deliveryAtDate = toDate(deliveryAt ?? null);

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
        title={t(isPaid ? 'final.paidHeaderTitle' : 'final.title')}
        description={t(
          isPaid ? 'final.paidHeaderDescription' : 'final.description'
        )}
      />
      {isPaid ? (
        <div className="mt-2 space-y-4 rounded-2xl border-2 border-deskpet-mint bg-deskpet-mint-soft/40 p-5">
          <div>
            <p className="m-0 text-lg font-black text-deskpet-ink">
              {t('final.paidTitle')}
            </p>
            <p className="mt-2 m-0 text-sm leading-6 text-deskpet-muted">
              {t('final.paidDescription')}
            </p>
          </div>

          <div className="rounded-xl border border-deskpet-ink/10 bg-white/70 px-4 py-3 dark:bg-card/60">
            <p className="m-0 text-xs font-black tracking-[0.08em] text-[#11685e]">
              {t('final.deliveryLabel')}
            </p>
            <p className="mt-1 m-0 text-base font-black text-deskpet-ink">
              {deliveryAtDate
                ? t('final.deliveryValue', {
                    datetime: formatDateTime(deliveryAtDate),
                  })
                : t('final.deliveryFallback')}
            </p>
          </div>

          <div className="space-y-2 text-sm leading-6 text-deskpet-muted">
            <p className="m-0">
              {userEmail
                ? t('final.contactEmail', { email: userEmail })
                : t('final.contactEmailFallback')}
            </p>
            <p className="m-0">
              {t('final.supportEmail', { email: SUPPORT_EMAIL })}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="flex w-full max-w-sm flex-col gap-2.5">
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
