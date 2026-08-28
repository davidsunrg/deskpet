'use client';

import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { TimerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const OFFER_DURATION_MS = 2 * 60 * 60 * 1000;
const OFFER_STORAGE_KEY = 'deskpet:custom-pet-offer-expiration';

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

  return {
    hours: padTwo(Math.floor(totalSeconds / 3600)),
    minutes: padTwo(Math.floor((totalSeconds % 3600) / 60)),
    seconds: padTwo(totalSeconds % 60),
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

type CustomPetLimitedOfferBannerProps = {
  className?: string;
};

export function CustomPetLimitedOfferBanner({
  className,
}: CustomPetLimitedOfferBannerProps) {
  const t = useTranslations('DashboardPetDetail');
  const { hours, minutes, seconds, expired, mounted } = useOfferCountdown();
  const values = mounted ? [hours, minutes, seconds] : ['02', '00', '00'];

  return (
    <aside
      className={cn(
        'w-full rounded-[18px] border-2 border-deskpet-ink bg-[#fff0ef]',
        'px-3 py-2.5 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] sm:px-4',
        className
      )}
      aria-label={t(
        `final.pricing.${expired ? 'offerTitleEnded' : 'offerLabel'}`
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-deskpet-ink bg-[#e53e3e] text-white">
            <TimerIcon className="size-3.5" aria-hidden />
          </div>
          <p className="m-0 text-[10px] font-black tracking-[0.1em] text-[#d53535] sm:text-xs">
            {t(`final.pricing.${expired ? 'offerTitleEnded' : 'offerLabel'}`)}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-1 font-black text-[#d93636] tabular-nums"
          aria-live="polite"
        >
          {values.map((value, index) => (
            <div className="contents" key={index}>
              {index > 0 ? <span aria-hidden>:</span> : null}
              <span className="min-w-8 rounded-lg border-2 border-deskpet-ink bg-[#e33e3e] px-1 py-1 text-center text-xs text-white sm:min-w-9 sm:text-sm">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
