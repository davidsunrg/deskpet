import { CtaButton } from '@/components/ui/cta-button';
import { getServerTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { AppleIcon, DownloadIcon, MonitorIcon } from 'lucide-react';
import type { DownloadCard, DownloadCardId } from './download-config';

type DownloadPlatformsProps = {
  cards: DownloadCard[];
};

const CARD_ICONS: Record<DownloadCardId, typeof MonitorIcon> = {
  windows: MonitorIcon,
  macos: AppleIcon,
};

export function DownloadPlatforms({ cards }: DownloadPlatformsProps) {
  const t = getServerTranslations('DownloadPage');

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
      data-testid="download-platform-cards"
    >
      {cards.map((card) => {
        const Icon = CARD_ICONS[card.id];
        const tagCount = t.raw(`cards.${card.id}.tags`);
        const tags = Array.isArray(tagCount) ? (tagCount as string[]) : [];
        const available = Boolean(card.href);

        return (
          <div
            key={card.id}
            data-testid={`download-platform-${card.id}`}
            className={cn(
              'rounded-3xl border-2 border-deskpet-ink bg-white p-8 text-center',
              'shadow-[6px_6px_0_0_rgba(56,42,53,0.12)]'
            )}
          >
            <div className="mx-auto mb-6 grid size-[72px] place-items-center rounded-[20px] border-2 border-deskpet-ink bg-[#fff2c8]">
              <Icon className="size-[34px] text-deskpet-ink" aria-hidden />
            </div>

            <h2 className="m-0 text-[34px] font-black tracking-tight text-deskpet-ink">
              {t(`cards.${card.id}.title`)}
            </h2>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-deskpet-ink/12 bg-white px-3.5 py-2 text-[13px] font-bold text-deskpet-ink"
                >
                  {tag}
                </span>
              ))}
            </div>

            {available ? (
              <CtaButton
                asChild
                className="mt-7 h-14 w-full rounded-2xl text-[17px]"
                data-testid={`download-cta-${card.id}`}
              >
                <a href={card.href!} download>
                  <DownloadIcon className="size-5" aria-hidden />
                  {t(`cards.${card.id}.cta`)}
                </a>
              </CtaButton>
            ) : (
              <p
                className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl border-2 border-dashed border-deskpet-ink/25 bg-[#f7f1e0] text-[17px] font-black tracking-tight text-deskpet-ink/70"
                data-testid={`download-cta-${card.id}`}
              >
                {t('comingSoon')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
