'use client';

import { CustomPetHeroDogIcon } from '@/components/dashboard/custom-pet-hero-dog-icon';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { IconCalendar, IconLoader2 } from '@tabler/icons-react';

const QUEUE_COUNT = 6;
const PRICE = '$79.99';
const OLD_PRICE = '$129.99';
const DELIVERY_HOURS = 24;

function DashedDivider() {
  return (
    <div
      className="my-3 h-0.5 bg-[repeating-linear-gradient(to_right,rgba(17,104,94,0.35)_0,rgba(17,104,94,0.35)_8px,transparent_8px,transparent_14px)] sm:my-3.5"
      aria-hidden
    />
  );
}

type CustomPetFinalPricingCardProps = {
  className?: string;
  busy?: boolean;
  onJoinQueue: () => void | Promise<void>;
};

export function CustomPetFinalPricingCard({
  className,
  busy = false,
  onJoinQueue,
}: CustomPetFinalPricingCardProps) {
  const t = useTranslations('DashboardPetDetail');
  const tp = (key: string, values?: Record<string, string | number>) =>
    t(`final.pricing.${key}`, values);

  return (
    <article
      className={cn(
        'w-full overflow-hidden rounded-[22px] border-2 border-deskpet-ink',
        'bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.12),transparent_25%),linear-gradient(135deg,#62d8bc_0%,#55cdb4_55%,#68d9bd_100%)]',
        'shadow-[5px_6px_0_0_rgba(53,93,84,0.14)]',
        className
      )}
    >
      <div className="px-3.5 py-3.5 sm:px-4 sm:py-4">
        <div className="mb-3 flex items-center justify-between gap-2.5">
          <p className="m-0 text-xs font-black tracking-[0.08em] text-[#0d6359] sm:text-sm">
            {tp('brand')}
          </p>
          <span className="rounded-full border-2 border-deskpet-ink px-3 py-1 text-[11px] font-black text-deskpet-ink sm:text-xs">
            {tp('oneTimeBadge')}
          </span>
        </div>

        <section className="relative mb-3 pr-0 sm:pr-20">
          <h3 className="m-0 mb-1.5 text-xl font-black leading-tight tracking-tight text-deskpet-ink sm:text-2xl">
            {tp('heroTitle')}
          </h3>
          <p className="m-0 max-w-[16rem] whitespace-pre-line text-[13px] leading-relaxed text-[#21766c] sm:text-sm">
            {tp('heroDescription')}
          </p>
          <div className="absolute right-0 top-0 hidden size-[4.5rem] sm:block">
            <CustomPetHeroDogIcon className="size-full" />
          </div>
        </section>

        <DashedDivider />

        <section className="flex items-center gap-3 py-0.5">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-[#11685e] text-deskpet-ink">
            <IconCalendar className="size-4" aria-hidden />
          </div>
          <div>
            <p className="m-0 mb-1 text-xs font-black text-[#11685e]">
              {tp('deliveryLabel')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-xl leading-none text-deskpet-ink">
                {DELIVERY_HOURS}
              </strong>
              <span className="text-sm font-bold text-deskpet-ink">
                {tp('deliveryHours')}
              </span>
            </div>
            <p className="mt-1 m-0 text-xs text-[#23776d]">
              {tp('deliveryDescription')}
            </p>
          </div>
        </section>

        <DashedDivider />

        <section className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="m-0 text-[clamp(32px,4.5vw,38px)] font-black leading-none tracking-tight text-deskpet-ink">
              {PRICE}
            </p>
            <p className="mt-1 m-0 text-xs font-extrabold text-[#11685e]">
              {tp('priceCaption')}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="m-0 mb-1 text-base font-extrabold text-[#22756b] line-through decoration-2">
              {OLD_PRICE}
            </p>
            <span className="inline-block rounded-full border-2 border-deskpet-ink bg-[#ffd45e] px-3 py-1 text-xs font-black text-deskpet-ink">
              {tp('savePill')}
            </span>
          </div>
        </section>

        <Button
          type="button"
          disabled={busy}
          onClick={() => {
            void onJoinQueue();
          }}
          className={cn(
            'mt-3 min-h-[48px] h-auto w-full rounded-full border-[3px] border-deskpet-ink',
            'bg-[linear-gradient(180deg,#ffd964,#ffd052)] px-4 py-3 text-[15px] font-black text-deskpet-ink',
            'shadow-[5px_6px_0_0_rgba(51,81,73,0.18)] transition-[transform,box-shadow] duration-150',
            'hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,#ffd964,#ffd052)] hover:shadow-[5px_8px_0_0_rgba(51,81,73,0.18)]',
            'active:translate-y-px active:shadow-[3px_3px_0_0_rgba(51,81,73,0.18)]'
          )}
        >
          {busy ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {tp('cta')}
            </>
          ) : (
            tp('cta')
          )}
        </Button>

        <p className="mt-2.5 m-0 text-center text-[11px] font-bold text-[#176d63] sm:text-xs">
          <span
            className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-[#df3d3d]"
            aria-hidden
          />
          {tp('belowCta', { count: QUEUE_COUNT })}
        </p>
      </div>
    </article>
  );
}
