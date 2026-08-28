'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/utils/cn';
import { PlayIcon } from 'lucide-react';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useEffect, useRef, useState } from 'react';

const CDN_BASE = 'https://cdn.deskpet.ai';

const VIDEO_IDS = ['world-cup-striker', 'penalty-hero'] as const;

type VideoId = (typeof VIDEO_IDS)[number];

const VIDEOS: Record<
  VideoId,
  {
    videoSrc: string;
    posterSrc: string;
  }
> = {
  'world-cup-striker': {
    videoSrc: `${CDN_BASE}/media/viral-pet-videos/world-cup-striker.mp4`,
    posterSrc: `${CDN_BASE}/media/viral-pet-videos/world-cup-striker.jpg`,
  },
  'penalty-hero': {
    videoSrc: `${CDN_BASE}/media/viral-pet-videos/penalty-hero.mp4`,
    posterSrc: `${CDN_BASE}/media/viral-pet-videos/penalty-hero.jpg`,
  },
};

const STAT_IDS = ['photos', 'scenes', 'clips'] as const;

/**
 * Homepage showcase of AI pet videos. Click a thumbnail to play.
 */
export default function ViralPetVideosSection() {
  const t = useTranslations('HomePage.viralPetVideos');
  const [playingId, setPlayingId] = useState<VideoId | null>(null);
  const videoRefs = useRef<Partial<Record<VideoId, HTMLVideoElement | null>>>(
    {}
  );

  const playVideo = (id: VideoId) => {
    for (const otherId of VIDEO_IDS) {
      if (otherId === id) continue;
      const other = videoRefs.current[otherId];
      if (other) {
        other.pause();
        other.currentTime = 0;
      }
    }
    setPlayingId(id);
  };

  useEffect(() => {
    if (!playingId) return;
    const video = videoRefs.current[playingId];
    if (!video) return;
    void video.play().catch(() => {
      // Autoplay can fail until the user interacts again; controls remain.
    });
  }, [playingId]);

  return (
    <section
      id="viral-pet-videos"
      className="relative isolate overflow-hidden px-4 pt-8 pb-16 md:pt-10 md:pb-20"
    >
      <div className="relative mx-auto max-w-7xl px-1 sm:px-2">
        <ScrollReveal>
          <div className="mx-auto mb-[22px] max-w-3xl space-y-3 text-center">
            <HeaderSection
              title={t('badge')}
              subtitle={t('title')}
              className="items-center gap-2 text-center"
              titleClassName="text-[13px] font-black tracking-[0.08em] text-[#155b43] dark:text-deskpet-mint"
              subtitleClassName="text-balance text-[clamp(34px,5vw,48px)] font-black leading-[1.05] tracking-[-0.045em] text-deskpet-ink dark:text-foreground"
            />
            <p className="text-base font-medium leading-[1.6] text-muted-foreground">
              {t('description')}
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
          {VIDEO_IDS.map((id, index) => {
            const asset = VIDEOS[id];
            const isPlaying = playingId === id;
            return (
              <ScrollReveal
                key={id}
                delay={index * 70}
                className="group h-full"
              >
                <article
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-deskpet-ink bg-deskpet-paper',
                    'shadow-[5px_5px_0_0_rgba(55,39,51,0.11)]',
                    'dark:border-border dark:bg-card dark:shadow-[5px_5px_0_0_rgba(0,0,0,0.35)]'
                  )}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-deskpet-ink">
                    {/* biome-ignore lint/a11y/useMediaCaption: decorative marketing clips without dialogue */}
                    <video
                      ref={(node) => {
                        videoRefs.current[id] = node;
                      }}
                      src={asset.videoSrc}
                      poster={asset.posterSrc}
                      controls={isPlaying}
                      playsInline
                      preload="metadata"
                      className={cn(
                        'absolute inset-0 size-full object-cover',
                        isPlaying
                          ? 'opacity-100'
                          : 'pointer-events-none opacity-0'
                      )}
                      onEnded={() => setPlayingId(null)}
                    />

                    {!isPlaying ? (
                      <button
                        type="button"
                        onClick={() => playVideo(id)}
                        aria-label={t('playLabel', {
                          title: t(`cards.${id}.title`),
                        })}
                        className="absolute inset-0 cursor-pointer"
                      >
                        <img
                          src={asset.posterSrc}
                          alt={t(`cards.${id}.imageAlt`)}
                          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 bg-linear-to-t from-deskpet-ink/65 via-deskpet-ink/10 to-transparent"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full border-2 border-deskpet-ink bg-deskpet-paper px-2 py-0.5 text-[10px] font-black text-deskpet-ink shadow-[2px_2px_0_0_rgba(55,39,51,0.12)] dark:border-border dark:bg-card dark:text-foreground">
                          {t(`cards.${id}.badge`)}
                        </span>
                        <span className="absolute top-1/2 left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-deskpet-ink bg-deskpet-mint text-deskpet-ink shadow-[3px_3px_0_0_rgba(55,39,51,0.2)] transition-transform duration-200 group-hover:scale-105">
                          <PlayIcon
                            className="size-6 fill-current"
                            aria-hidden
                          />
                        </span>
                        <div className="absolute inset-x-0 bottom-0 space-y-1 p-3 text-left sm:p-4">
                          <h3 className="line-clamp-2 text-[15px] font-black leading-[1.15] tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] sm:text-base">
                            {t(`cards.${id}.title`)}
                          </h3>
                          <p className="line-clamp-2 text-[12px] font-medium leading-[1.35] text-white/90 sm:text-[13px]">
                            {t(`cards.${id}.prompt`)}
                          </p>
                        </div>
                      </button>
                    ) : null}
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={200}>
          <div className="mt-8 flex flex-col items-center gap-5">
            <Button
              asChild
              size="lg"
              variant="brutal"
              className="h-11 px-6 text-sm"
            >
              <LocaleLink href={Routes.PetVideoCreator}>{t('cta')}</LocaleLink>
            </Button>

            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] font-semibold text-deskpet-muted dark:text-muted-foreground">
              {STAT_IDS.map((id) => (
                <li key={id} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-deskpet-mint"
                  />
                  {t(`stats.${id}`)}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
