'use client';

import { CustomPetHeroDogIcon } from '@/components/dashboard/custom-pet-hero-dog-icon';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import {
  IconCalendar,
  IconLoader2,
} from '@tabler/icons-react';
import { TimerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const OFFER_DURATION_MS = 2 * 60 * 60 * 1000;
const OFFER_STORAGE_KEY = 'deskpet:custom-pet-offer-expiration';
const QUEUE_COUNT = 27;
const PRICE = '$79.99';
const OLD_PRICE = '$129.99';
const DELIVERY_HOURS = 24;

type CountdownParts = {
  hours: string;
  minutes: string;
  seconds: string;
  expired: boolean;
};

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

function readCountdown(expirationTime: number): CountdownParts {
  const remaining = Math.max(0, expirationTime - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: padTwo(hours),
    minutes: padTwo(minutes),
    seconds: padTwo(seconds),
    expired: remaining <= 0,
  };
}

function getOrCreateExpirationTime(): number {
  const saved = localStorage.getItem(OFFER_STORAGE_KEY);
  if (saved) {
    const timestamp = Number(saved);
    if (Number.isFinite(timestamp) && timestamp > Date.now()) {
      return timestamp;
    }
  }

  const next = Date.now() + OFFER_DURATION_MS;
  localStorage.setItem(OFFER_STORAGE_KEY, String(next));
  return next;
}

function useOfferCountdown(): CountdownParts & { mounted: boolean } {
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState<CountdownParts>(() =>
    readCountdown(Date.now() + OFFER_DURATION_MS)
  );

  useEffect(() => {
    const expirationTime = getOrCreateExpirationTime();
    setMounted(true);
    setCountdown(readCountdown(expirationTime));

    const intervalId = window.setInterval(() => {
      setCountdown(readCountdown(expirationTime));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return { ...countdown, mounted };
}

function DashedDivider() {
  return (
    <div
      className="my-4 h-0.5 bg-[repeating-linear-gradient(to_right,rgba(17,104,94,0.35)_0,rgba(17,104,94,0.35)_8px,transparent_8px,transparent_14px)] sm:my-5"
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
  const t = useTranslations('CreatePetWizard');
  const tp = (key: string, values?: Record<string, string | number>) =>
    t(`final.pricing.${key}`, values);
  const { hours, minutes, seconds, expired, mounted } = useOfferCountdown();

  const displayHours = mounted ? hours : '02';
  const displayMinutes = mounted ? minutes : '00';
  const displaySeconds = mounted ? seconds : '00';

  return (
    <article
      className={cn(
        'w-full overflow-hidden rounded-[22px] border-2 border-deskpet-ink',
        'bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.12),transparent_25%),linear-gradient(135deg,#62d8bc_0%,#55cdb4_55%,#68d9bd_100%)]',
        'shadow-[5px_6px_0_0_rgba(53,93,84,0.14)]',
        className
      )}
    >
      <section className="border-b-2 border-deskpet-ink/80 bg-[#fff0ef] px-4 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-deskpet-ink bg-[#e53e3e] text-white">
              <TimerIcon className="size-4" aria-hidden />
            </div>
            <p className="m-0 text-[10px] font-black tracking-[0.12em] text-[#d53535] sm:text-xs">
              {expired ? tp('offerTitleEnded') : tp('offerLabel')}
            </p>
          </div>

          <div
            className="flex shrink-0 items-center gap-1 font-black text-lg tracking-tight text-[#d93636] tabular-nums sm:text-xl"
            aria-live="polite"
          >
            <span className="min-w-9 rounded-lg border-2 border-deskpet-ink bg-[#e33e3e] px-1.5 py-1 text-center text-sm text-white sm:min-w-10">
              {displayHours}
            </span>
            <span>:</span>
            <span className="min-w-9 rounded-lg border-2 border-deskpet-ink bg-[#e33e3e] px-1.5 py-1 text-center text-sm text-white sm:min-w-10">
              {displayMinutes}
            </span>
            <span>:</span>
            <span className="min-w-9 rounded-lg border-2 border-deskpet-ink bg-[#e33e3e] px-1.5 py-1 text-center text-sm text-white sm:min-w-10">
              {displaySeconds}
            </span>
          </div>
        </div>
      </section>

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="m-0 text-xs font-black tracking-[0.08em] text-[#0d6359] sm:text-sm">
            {tp('brand')}
          </p>
          <span className="rounded-full border-2 border-deskpet-ink px-3 py-1 text-[11px] font-black text-deskpet-ink sm:text-xs">
            {tp('oneTimeBadge')}
          </span>
        </div>

        <section className="relative mb-4 pr-0 sm:pr-28">
          <h3 className="m-0 mb-2 text-2xl font-black leading-tight tracking-tight text-deskpet-ink sm:text-[28px]">
            {tp('heroTitle')}
          </h3>
          <p className="m-0 max-w-md whitespace-pre-line text-sm leading-relaxed text-[#21766c]">
            {tp('heroDescription')}
          </p>
          <div className="absolute right-0 top-0 hidden size-24 sm:block">
            <CustomPetHeroDogIcon className="size-full" />
          </div>
        </section>

        <DashedDivider />

        <section className="flex items-center gap-3 py-0.5">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-[#11685e] text-deskpet-ink">
            <IconCalendar className="size-5" aria-hidden />
          </div>
          <div>
            <p className="m-0 mb-1 text-xs font-black text-[#11685e]">
              {tp('deliveryLabel')}
            </p>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-2xl leading-none text-deskpet-ink">
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
            <p className="m-0 text-[clamp(36px,5vw,44px)] font-black leading-none tracking-tight text-deskpet-ink">
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
            'mt-4 min-h-[52px] h-auto w-full rounded-full border-[3px] border-deskpet-ink',
            'bg-[linear-gradient(180deg,#ffd964,#ffd052)] px-5 py-3.5 text-base font-black text-deskpet-ink',
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

        <p className="mt-3 m-0 text-center text-xs font-bold text-[#176d63]">
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
