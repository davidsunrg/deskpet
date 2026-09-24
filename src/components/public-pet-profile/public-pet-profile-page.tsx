'use client';

import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import { SelectedCatPreview } from '@/components/pets/selected-cat-preview';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes, playgroundRoute } from '@/lib/routes';
import type { PublicPetProfile } from '@/pets/public-pet-profile';
import type { ShowcasePet } from '@/utils/showcase-pets';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  DownloadIcon,
  HeartIcon,
  ImageIcon,
  ImagesIcon,
  type LucideIcon,
  MonitorIcon,
  PawPrintIcon,
  PlayIcon,
  SettingsIcon,
  VideoIcon,
} from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

type PublicPetProfilePageProps = {
  profile: PublicPetProfile;
  playPet: ShowcasePet | null;
};

type PreviewOrigin = {
  centerX: number;
  centerY: number;
};

const PHOTO_PLACEHOLDERS = [
  'Favorite portrait',
  'Morning adventure',
  'Cozy afternoon',
  'Park day',
  'Best smile',
  'Nap time',
  'Play time',
  'Little explorer',
] as const;

const VIDEO_PLACEHOLDERS = [
  { title: 'A happy little run', duration: '0:28' },
  { title: 'Playtime in the park', duration: '0:36' },
  { title: 'A cozy snow day', duration: '0:32' },
] as const;

function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-5">
      <h2 className="flex items-center gap-3 text-3xl font-bold tracking-normal text-[#43271f] [font-family:'Kalam',cursive] md:text-4xl">
        <Icon aria-hidden="true" className="size-7 text-[#ff6f61]" />
        {title}
      </h2>
    </div>
  );
}

function MediaPlaceholder({
  label,
  className = '',
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative grid overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#f7d9c5_0%,#fdece1_48%,#e7c8b1_100%)] ${className}`}
      role="img"
      aria-label={`${label} placeholder`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(255,255,255,0.85),transparent_25%),radial-gradient(circle_at_25%_85%,rgba(255,142,116,0.22),transparent_32%)]" />
      <div className="relative m-auto grid place-items-center text-[#9a6d5f]">
        <ImageIcon aria-hidden="true" className="size-8" />
        <span className="mt-2 text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}

export function PublicPetProfilePage({
  profile,
  playPet,
}: PublicPetProfilePageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [previewOrigin, setPreviewOrigin] = useState<PreviewOrigin | null>(
    null
  );
  const [previewHidden, setPreviewHidden] = useState(true);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      setPreviewOrigin({
        centerX: rect.left + rect.width * 0.48,
        centerY: rect.top + rect.height * 0.58,
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <article
      className="min-h-screen overflow-hidden bg-[#fffaf6] text-[#43271f] [font-family:'Nunito',sans-serif]"
      data-testid="public-pet-profile"
    >
      {playPet && previewOrigin && !previewHidden ? (
        <SelectedCatPreview
          pet={playPet}
          origin={previewOrigin}
          onHide={() => setPreviewHidden(true)}
        />
      ) : null}

      <section
        className="relative min-h-[560px] overflow-hidden px-5 pb-16 pt-5 sm:px-8 md:min-h-[620px] md:px-12"
        data-testid="public-pet-profile-hero"
      >
        <img
          src={profile.bannerSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[38%_center] sm:object-[44%_center] md:object-[48%_center] lg:object-center"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex items-center">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#6e4a3e]">
              <PawPrintIcon
                aria-hidden="true"
                className="size-5 fill-[#ff6f61] text-[#ff6f61]"
              />
              DeskPet
            </span>
          </div>

          <div className="pt-44 sm:pt-40 md:pt-36">
            <div className="relative max-w-[310px] p-4 sm:max-w-[380px] sm:p-5 md:max-w-lg md:p-6 lg:max-w-xl lg:p-8">
              <div
                aria-hidden="true"
                className="absolute -inset-2 bg-white/80 backdrop-blur-sm [mask-image:radial-gradient(ellipse_at_center,black_46%,transparent_68%)] sm:-inset-4 sm:bg-white/75 sm:backdrop-blur-md sm:[mask-image:radial-gradient(ellipse_at_center,black_43%,transparent_71%)] md:-inset-6 md:bg-white/70 md:[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_74%)] lg:-inset-x-10 lg:-inset-y-7 lg:bg-white/65 lg:backdrop-blur-lg lg:[mask-image:radial-gradient(ellipse_at_center,black_38%,transparent_76%)]"
              />
              <div className="relative z-10">
                <h1 className="text-6xl font-bold leading-[0.95] tracking-normal text-[#3f241c] [font-family:'Kalam',cursive] sm:text-7xl md:text-8xl">
                  {profile.name}
                  <PawPrintIcon
                    aria-hidden="true"
                    className="ml-4 inline size-12 rotate-12 fill-[#ff6f61] text-[#ff6f61] md:size-14"
                  />
                </h1>
                <p className="mt-3 max-w-md text-2xl font-normal leading-8 text-[#594038] [font-family:'Kalam',cursive]">
                  {profile.description}
                </p>
                <a
                  href="#desktop-pet"
                  className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff6f61] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(238,101,88,0.28)] transition hover:bg-[#ec5d52]"
                >
                  <PlayIcon
                    aria-hidden="true"
                    className="size-4 fill-current"
                  />
                  Meet {profile.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-[#fffaf6] px-5 pb-12 pt-10 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <section
            id="desktop-pet"
            className="scroll-mt-24 py-5"
            data-testid="public-pet-profile-desktop-pet"
          >
            <SectionHeading title="Desktop Pet" icon={MonitorIcon} />
            <div className="grid overflow-hidden rounded-[28px] border border-[#f0ded3] bg-[linear-gradient(105deg,#fff_0%,#fff8f2_64%,#fff0e8_100%)] shadow-[0_14px_38px_rgba(100,62,47,0.08)] lg:grid-cols-[1fr_260px]">
              <div
                ref={stageRef}
                className="relative grid min-h-[330px] place-items-center overflow-hidden border-b border-[#f0ded3] lg:border-b-0 lg:border-r"
              >
                <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(transparent,rgba(244,214,194,0.35))]" />
                <div className="grid grid-cols-3 items-end gap-5 px-6">
                  {[0.74, 1, 0.82].map((scale, index) => (
                    <div
                      key={scale}
                      className="flex flex-col items-center"
                      aria-hidden="true"
                    >
                      <div
                        className="grid h-32 w-28 place-items-center rounded-[45%_45%_36%_36%] border-2 border-dashed border-[#d9b7a5] bg-[#f7e8dd]/80 text-[#b48875]"
                        style={{ transform: `scale(${scale})` }}
                      >
                        <PawPrintIcon className="size-9 opacity-70" />
                      </div>
                      <div className="mt-2 h-3 w-24 rounded-full bg-[#6f5147]/10 blur-[2px]" />
                      <span className="mt-2 text-[10px] font-bold text-[#9a7568]">
                        Pose {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
                {previewHidden && playPet ? (
                  <button
                    type="button"
                    onClick={() => setPreviewHidden(false)}
                    className="absolute bottom-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#68483d] shadow"
                  >
                    Play with {profile.name}
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col justify-center gap-3 p-6">
                <Button
                  asChild
                  className="h-12 rounded-full bg-[#ff6f61] font-bold text-white hover:bg-[#ec5d52]"
                >
                  <LocaleLink
                    href={playgroundRoute(playPet?.id ?? 'golden-retriever')}
                  >
                    <PlayIcon className="size-4 fill-current" />
                    Open Playground
                  </LocaleLink>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#ead8ce] bg-white font-bold"
                >
                  <LocaleLink href={Routes.DesktopPetCreator}>
                    <SettingsIcon className="size-4" />
                    Customize
                  </LocaleLink>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-[#ead8ce] bg-white font-bold"
                >
                  <LocaleLink href={Routes.Download}>
                    <DownloadIcon className="size-4" />
                    Download App
                  </LocaleLink>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-8" data-testid="public-pet-profile-photos">
            <SectionHeading
              title={`${profile.name}'s Photos`}
              icon={ImagesIcon}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {PHOTO_PLACEHOLDERS.map((label, index) => (
                <MediaPlaceholder
                  key={label}
                  label={label}
                  className={
                    index === 0
                      ? 'aspect-[4/3] sm:col-span-2 sm:row-span-2'
                      : 'aspect-[4/3]'
                  }
                />
              ))}
            </div>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-[#ffe7e2] px-5 py-2.5 text-xs font-bold text-[#704d42] disabled:opacity-100"
              >
                See more photos
                <ArrowDownIcon className="size-4" />
              </button>
            </div>
          </section>

          <section className="py-8" data-testid="public-pet-profile-videos">
            <SectionHeading title="Videos" icon={VideoIcon} />
            <div className="grid gap-4 md:grid-cols-3">
              {VIDEO_PLACEHOLDERS.map((video) => (
                <div
                  key={video.title}
                  className="relative aspect-video overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#dfc2ae,#f9e8dd_50%,#efc9b4)]"
                  role="img"
                  aria-label={`${video.title} video placeholder`}
                >
                  <VideoIcon className="absolute right-4 top-4 size-6 text-white/80" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="grid size-12 place-items-center rounded-full bg-[#43271f]/75 text-white shadow-lg">
                      <PlayIcon className="ml-0.5 size-5 fill-current" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#43271f]/70 to-transparent p-4 pt-12 text-white">
                    <span className="text-sm font-bold">{video.title}</span>
                    <span className="rounded bg-black/45 px-2 py-1 text-xs font-bold">
                      {video.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-[#ffe7e2] px-5 py-2.5 text-xs font-bold text-[#704d42] disabled:opacity-100"
              >
                See more videos
                <ArrowDownIcon className="size-4" />
              </button>
            </div>
          </section>

          <section className="py-8" data-testid="public-pet-profile-about">
            <SectionHeading title={`About ${profile.name}`} icon={HeartIcon} />
            <div className="grid gap-6 rounded-[28px] border border-[#f1dfd4] bg-[#fff5ed] p-6 md:grid-cols-[180px_1fr] md:p-8">
              <div className="grid min-h-44 place-items-center rounded-full border-2 border-dashed border-[#d9b7a5] bg-white/70 text-center text-[#9a6d5f]">
                <div>
                  <ImageIcon className="mx-auto size-8" />
                  <span className="mt-2 block text-xs font-bold">
                    Portrait placeholder
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium leading-6 text-[#75594f]">
                  {profile.about}
                </p>
                <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {profile.stats.map(({ label, value }) => (
                    <div
                      key={label}
                      className="grid grid-cols-[100px_1fr] gap-3"
                    >
                      <dt className="text-xs font-bold text-[#4f332a]">
                        {label}
                      </dt>
                      <dd className="text-xs font-medium text-[#80665d]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  {profile.traits.map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#79584d] shadow-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer
        className="relative overflow-hidden bg-[linear-gradient(105deg,#fff0e4_0%,#ffe5d5_100%)] px-6 py-12 md:px-12"
        data-testid="public-pet-profile-promo"
      >
        <PawPrintIcon className="absolute -bottom-3 left-8 size-20 rotate-[-18deg] fill-[#f8bea1]/50 text-[#f8bea1]/50" />
        <HeartIcon className="absolute right-[10%] top-5 size-8 rotate-12 fill-[#ff8a76]/30 text-[#ff8a76]/30" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-normal text-[#4a2a20] [font-family:'Kalam',cursive] md:text-4xl">
              {`Love a page like ${profile.name}'s?`}
            </h2>
            <p className="mt-1 text-xl font-normal text-[#806157] [font-family:'Kalam',cursive]">
              Bring your own pet to life with DeskPet.
            </p>
          </div>
          <Button
            asChild
            className="h-14 rounded-full bg-[#f2574f] px-9 text-base font-bold text-white shadow-[0_10px_22px_rgba(224,76,66,0.24)] hover:bg-[#df4c45]"
          >
            <LocaleLink href={Routes.DesktopPetCreator}>
              Make My Pet
              <ArrowRightIcon className="size-5" />
            </LocaleLink>
          </Button>
        </div>
      </footer>
    </article>
  );
}
