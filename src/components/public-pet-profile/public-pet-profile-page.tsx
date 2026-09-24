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
import type { PublicPetProfile } from '@/pets/public-pet-profile';
import type { PlaygroundPet } from '@/utils/playground-pet';
import {
  ArrowRightIcon,
  BookOpenIcon,
  Gamepad2Icon,
  HeartIcon,
  ImageIcon,
  ImagesIcon,
  type LucideIcon,
  PawPrintIcon,
  PlayIcon,
  SmartphoneIcon,
  SparklesIcon,
} from 'lucide-react';

const COPPER_PLAYGROUND_DEMO_HREF = '/demo/puppy/';
const COPPER_MEMORY_BOOK_DEMO_HREF = '/demo/memory-book/';

type PublicPetProfilePageProps = {
  profile: PublicPetProfile;
  playgroundPet: PlaygroundPet | null;
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

export function PublicPetProfilePage({
  profile,
  playgroundPet,
}: PublicPetProfilePageProps) {
  return (
    <article
      className="min-h-screen overflow-hidden bg-[#fffaf6] text-[#43271f] [font-family:'Nunito',sans-serif]"
      data-testid="public-pet-profile"
    >
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
          <div className="pt-44 sm:pt-40 md:pt-36">
            <div className="max-w-[310px] sm:max-w-[380px] md:max-w-lg lg:max-w-xl">
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
      </section>

      <div className="bg-[#fffaf6] px-5 pb-12 pt-10 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <section
            id="desktop-pet"
            className="scroll-mt-24 py-5"
            data-testid="public-pet-profile-desktop-pet"
          >
            <SectionHeading
              title={`Play with ${profile.name}`}
              icon={Gamepad2Icon}
            />
            <ProfilePlayCard
              name={profile.name}
              playgroundPet={playgroundPet}
            />
            <DemoExperienceLink
              href={COPPER_PLAYGROUND_DEMO_HREF}
              title={`Enter ${profile.name}'s Playground`}
              description="A full-screen interactive scene with its own videos and environments."
              icon={SparklesIcon}
              testId="public-pet-profile-playground-demo-link"
            />
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
