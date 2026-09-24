'use client';

import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes, playgroundRoute } from '@/lib/routes';
import type { PublicPetProfile } from '@/pets/public-pet-profile';
import { DownloadIcon, ImageIcon, PlayIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';

type ProfilePlayCardProps = {
  profile: PublicPetProfile;
};

const CLIP_PLACEHOLDER_LABELS = [
  'Wave hello',
  'Playful bark',
  'Space helmet',
] as const;

function PlayClip({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#ead8ce] bg-white shadow-sm">
      {showImage ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover object-center"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="grid size-full place-items-center bg-[linear-gradient(180deg,#fffaf6_0%,#f7ebe0_100%)] px-2 text-center text-[#9a6d5f]"
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
          : 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#43271f]/15 bg-white px-5 text-sm font-bold text-[#43271f] transition hover:border-[#ff6f61]/35 hover:bg-[#fffaf6]'
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
      className="rounded-[24px] border border-[#f1dfd4] bg-[#fff5ed] p-5 sm:p-6"
      data-testid="public-pet-profile-play-card"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        <div
          className="grid flex-1 grid-cols-3 gap-2 sm:gap-3"
          data-testid="public-pet-profile-play-clips"
        >
          {CLIP_PLACEHOLDER_LABELS.map((label, index) => (
            <PlayClip key={label} src={clips?.[index]} label={label} />
          ))}
        </div>

        <div
          className="flex shrink-0 flex-col justify-center gap-3 lg:w-[min(100%,240px)]"
          data-testid="public-pet-profile-play-actions"
        >
          <PlayActionButton
            href={playgroundHref}
            label="Open Playground"
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
            label="Download App"
            icon={DownloadIcon}
          />
        </div>
      </div>
    </div>
  );
}
