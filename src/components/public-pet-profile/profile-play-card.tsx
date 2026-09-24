'use client';

import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes, playgroundRoute } from '@/lib/routes';
import type { PublicPetProfile } from '@/pets/public-pet-profile';
import { GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_LABELS } from '@/pets/public-pet-profile-play-clips';
import { DownloadIcon, ImageIcon, PlayIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';

type ProfilePlayCardProps = {
  profile: PublicPetProfile;
};

function isVideoClipSrc(src: string): boolean {
  return /\.(webm|mp4)(\?|#|$)/i.test(src);
}

function PlayClip({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const showMedia = Boolean(src) && !failed;

  return (
    <div className="relative h-[160px] overflow-hidden rounded-2xl bg-transparent sm:h-[184px] md:h-[204px]">
      {showMedia ? (
        isVideoClipSrc(src!) ? (
          <video
            src={src}
            className="absolute bottom-0 left-1/2 h-[142%] w-full max-w-full -translate-x-1/2 object-contain object-bottom"
            autoPlay
            loop
            muted
            playsInline
            aria-label={label}
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            src={src}
            alt=""
            className="absolute bottom-0 left-1/2 h-[142%] w-full max-w-full -translate-x-1/2 object-contain object-bottom"
            onError={() => setFailed(true)}
          />
        )
      ) : (
        <div
          className="grid size-full place-items-center bg-[#fff0e8]/40 px-2 text-center text-[#9a6d5f]"
          role="img"
          aria-label={`${label} clip placeholder`}
        >
          <ImageIcon aria-hidden="true" className="size-8 opacity-70" />
          <span className="mt-2 text-[11px] font-bold leading-snug">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

function PlayActionButton({
  href,
  label,
  icon: Icon,
  variant = 'secondary',
}: {
  href: string;
  label: string;
  icon: typeof PlayIcon;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <LocaleLink
      href={href}
      className={
        isPrimary
          ? 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff6f61] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(238,101,88,0.22)] transition hover:bg-[#ec5d52]'
          : 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#43271f]/15 bg-white px-5 text-sm font-bold text-[#43271f] transition hover:border-[#ff6f61]/35 hover:bg-[#fff5ed]'
      }
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </LocaleLink>
  );
}

export function ProfilePlayCard({ profile }: ProfilePlayCardProps) {
  const clips = profile.playClipSrcs;
  const playgroundHref = playgroundRoute({
    petKey: profile.playgroundPetKey ?? null,
  });

  return (
    <div
      className="rounded-[28px] bg-[#fff5ed] px-4 py-2 sm:px-5 sm:py-2.5"
      data-testid="public-pet-profile-play-card"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div
          className="grid flex-1 grid-cols-3 gap-2 sm:gap-3"
          data-testid="public-pet-profile-play-clips"
        >
          {GOLDEN_RETRIEVER_PUBLIC_PLAY_CLIP_LABELS.map((label, index) => (
            <PlayClip key={label} src={clips?.[index]} label={label} />
          ))}
        </div>

        <div
          className="flex shrink-0 flex-col justify-center gap-3 lg:w-[min(100%,240px)]"
          data-testid="public-pet-profile-play-actions"
        >
          <PlayActionButton
            href={playgroundHref}
            label="Playground"
            icon={PlayIcon}
            variant="primary"
          />
          <PlayActionButton
            href={Routes.DesktopPetCreator}
            label="Customize"
            icon={SettingsIcon}
          />
          <PlayActionButton
            href={Routes.Download}
            label="Download"
            icon={DownloadIcon}
          />
        </div>
      </div>
    </div>
  );
}
