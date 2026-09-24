'use client';

import '@fontsource/kalam/400.css';
import '@fontsource/kalam/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import { ProfilePlayCard } from '@/components/public-pet-profile/profile-play-card';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import type { PublicPetProfile } from '@/pets/public-pet-profile';
import {
  ArrowRightIcon,
  BookOpenIcon,
  Gamepad2Icon,
  HeartIcon,
  ImageIcon,
  ImagesIcon,
  type LucideIcon,
  OrbitIcon,
  PawPrintIcon,
  PlayIcon,
  SmartphoneIcon,
  StarIcon,
} from 'lucide-react';

const COPPER_MEMORY_BOOK_DEMO_HREF = '/demo/memory-book/';

type PublicPetProfilePageProps = {
  profile: PublicPetProfile;
};

const MOMENT_PLACEHOLDERS = [
  'Favorite portrait',
  'Morning adventure',
  'Cozy afternoon',
  'Park day',
] as const;

const WALLPAPER_PLACEHOLDERS = [
  { label: 'Morning light', live: false },
  { label: 'Tail wag', live: true },
  { label: 'Cozy nap', live: false },
  { label: 'Park stroll', live: true },
] as const;

const MEDIA_FRAME_CLASS =
  'relative grid overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#f7d9c5_0%,#fdece1_48%,#e7c8b1_100%)]';

const MEDIA_WASH_CLASS =
  'absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(255,255,255,0.85),transparent_25%),radial-gradient(circle_at_25%_85%,rgba(255,142,116,0.22),transparent_32%)]';

function DemoExperienceLink({
  href,
  title,
  description,
  icon: Icon,
  testId,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  testId: string;
}) {
  return (
    <a
      href={href}
      data-testid={testId}
      className="mt-5 flex flex-col gap-3 rounded-[24px] border border-[#f1dfd4] bg-[#fff5ed] p-5 transition hover:border-[#ff6f61]/35 hover:bg-[#fff0e8] sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#ff6f61]/12 text-[#ff6f61]">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-[#43271f] [font-family:'Kalam',cursive] md:text-xl">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#80665d]">{description}</p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#ff6f61] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(238,101,88,0.22)] sm:self-center">
        Open
        <ArrowRightIcon aria-hidden="true" className="size-4" />
      </span>
    </a>
  );
}

function SectionHeading({
  title,
  icon: Icon,
  className,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn('mb-5', className)}>
      <h2 className="flex items-center gap-3 text-3xl font-bold tracking-normal text-[#43271f] [font-family:'Kalam',cursive] md:text-4xl">
        <Icon aria-hidden="true" className="size-7 text-[#ff6f61]" />
        {title}
      </h2>
    </div>
  );
}

function MomentCard({ label }: { label: string }) {
  return (
    <div
      className={`${MEDIA_FRAME_CLASS} aspect-[4/3]`}
      role="img"
      aria-label={`${label} photo`}
    >
      <div className={MEDIA_WASH_CLASS} />
      <div className="relative m-auto grid place-items-center text-[#9a6d5f]">
        <ImageIcon aria-hidden="true" className="size-8" />
        <span className="mt-2 text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}

function HeroBannerWave() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 leading-none"
      aria-hidden="true"
      data-testid="public-pet-profile-hero-wave"
    >
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="block h-14 w-full sm:h-[4.75rem] md:h-24"
        role="presentation"
      >
        <path
          fill="#ffffff"
          d="M0,104 C160,104 240,48 400,44 C560,40 640,98 780,94 C920,90 1020,42 1160,46 C1300,50 1380,88 1440,92 L1440,140 L0,140 Z"
        />
      </svg>
    </div>
  );
}

function WallpaperCard({ label, live }: { label: string; live: boolean }) {
  return (
    <div
      className={`${MEDIA_FRAME_CLASS} aspect-[9/16]`}
      role="img"
      aria-label={live ? `${label} live wallpaper` : `${label} wallpaper`}
    >
      <div className={MEDIA_WASH_CLASS} />
      {live ? (
        <span className="absolute top-3 left-3 rounded-full bg-[#ff6f61] px-2.5 py-1 text-[11px] font-bold text-white">
          Live
        </span>
      ) : null}
      <div className="relative m-auto grid place-items-center px-3 text-center text-[#9a6d5f]">
        <ImageIcon aria-hidden="true" className="size-8" />
        <span className="mt-2 text-xs font-bold">{label}</span>
      </div>
    </div>
  );
}

export function PublicPetProfilePage({ profile }: PublicPetProfilePageProps) {
  return (
    <article
      className="min-h-screen overflow-hidden bg-white text-[#43271f] [font-family:'Nunito',sans-serif]"
      data-testid="public-pet-profile"
    >
      <section
        className="relative min-h-[560px] overflow-hidden px-5 pb-8 pt-5 sm:px-8 md:min-h-[620px] md:px-12"
        data-testid="public-pet-profile-hero"
      >
        <img
          src={profile.bannerSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[38%_center] sm:object-[44%_center] md:object-[48%_center] lg:object-center"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="pt-44 sm:pt-40 md:pt-36">
            <div
              className="relative max-w-[310px] px-1 py-2 sm:max-w-[380px] md:max-w-lg lg:max-w-xl"
              data-testid="public-pet-profile-hero-panel"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 bg-[radial-gradient(ellipse_90%_80%_at_50%_45%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.62)_42%,rgba(255,255,255,0.18)_68%,transparent_82%)] blur-2xl sm:-inset-x-14 sm:-inset-y-10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[38%] -z-10 h-[min(420px,120%)] w-[min(520px,135%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35 blur-3xl"
              />
              <StarIcon
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 top-6 size-5 fill-none stroke-white stroke-[1.75] text-white/90 sm:top-8 sm:size-6"
              />
              <HeartIcon
                aria-hidden="true"
                className="pointer-events-none absolute bottom-16 left-2 size-4 fill-none stroke-white stroke-[1.75] text-white/85 sm:bottom-20 sm:size-5"
              />
              <OrbitIcon
                aria-hidden="true"
                className="pointer-events-none absolute -left-3 top-2 size-6 fill-none stroke-white stroke-[1.5] text-white/80 sm:-left-5 sm:size-7"
              />
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
                <PlayIcon aria-hidden="true" className="size-4 fill-current" />
                Meet {profile.name}
              </a>
            </div>
          </div>
        </div>
        <HeroBannerWave />
      </section>

      <div className="relative z-20 -mt-6 bg-white px-5 pb-12 pt-2 sm:-mt-8 sm:px-8 sm:pt-3 md:-mt-10 md:px-12 md:pt-4">
        <div className="mx-auto max-w-7xl">
          <section
            id="desktop-pet"
            className="scroll-mt-24 pb-4"
            data-testid="public-pet-profile-desktop-pet"
          >
            <SectionHeading
              title={`Play with ${profile.name}`}
              icon={Gamepad2Icon}
              className="mb-3"
            />
            <ProfilePlayCard profile={profile} />
          </section>

          <section className="py-8" data-testid="public-pet-profile-wallpapers">
            <SectionHeading
              title={`${profile.name}'s Wallpapers`}
              icon={SmartphoneIcon}
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {WALLPAPER_PLACEHOLDERS.map((wallpaper) => (
                <WallpaperCard
                  key={wallpaper.label}
                  label={wallpaper.label}
                  live={wallpaper.live}
                />
              ))}
            </div>
          </section>

          <section className="py-8" data-testid="public-pet-profile-moments">
            <SectionHeading
              title={`${profile.name}'s Moments`}
              icon={ImagesIcon}
            />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {MOMENT_PLACEHOLDERS.map((label) => (
                <MomentCard key={label} label={label} />
              ))}
            </div>
            <DemoExperienceLink
              href={COPPER_MEMORY_BOOK_DEMO_HREF}
              title={`Open ${profile.name}'s Memory Book`}
              description="Flip through a handcrafted album made just for this companion."
              icon={BookOpenIcon}
              testId="public-pet-profile-memory-book-demo-link"
            />
          </section>

          <section className="py-8" data-testid="public-pet-profile-about">
            <SectionHeading title={`About ${profile.name}`} icon={HeartIcon} />
            <div className="flex flex-col items-center gap-5 rounded-[24px] border border-[#f1dfd4] bg-[#fff5ed] p-5 sm:flex-row sm:p-6">
              <img
                src={profile.bannerSrc}
                alt={`${profile.name} portrait`}
                className="size-20 shrink-0 rounded-full border-4 border-white object-cover object-[70%_center] shadow-sm"
              />
              <dl className="grid w-full gap-3 border-t border-[#ead8ce] pt-5 text-sm sm:border-l sm:border-t-0 sm:py-1 sm:pl-6">
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-bold text-[#4f332a]">Age</dt>
                  <dd className="text-[#80665d]">{profile.age}</dd>
                </div>
                <div className="grid grid-cols-[92px_1fr] gap-3">
                  <dt className="font-bold text-[#4f332a]">Personality</dt>
                  <dd className="text-[#80665d]">
                    {profile.traits.join(' · ')}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>

      <footer
        className="relative overflow-hidden bg-white px-6 py-12 md:px-12"
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
