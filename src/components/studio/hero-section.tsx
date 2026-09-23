import { Button } from '@/components/ui/button';
import { CtaButton } from '@/components/ui/cta-button';
import {
  IconBrandApple,
  IconDownload,
  IconLayoutGrid,
  IconMovie,
  IconPhoto,
} from '@tabler/icons-react';
import {
  StudioCardHeader,
  studioCardClass,
  studioSoftButtonClass,
  studioSoftCardClass,
} from './studio-card';

const creations = [
  {
    src: 'https://placehold.co/240x240/f7d9e3/a86b84?text=Bloom',
    alt: 'Mochi in cherry blossoms',
  },
  {
    src: 'https://placehold.co/240x240/d7e8f7/5f7d99?text=Hiking',
    alt: 'Mochi hiking',
  },
  {
    src: 'https://placehold.co/240x240/cfeef2/4f8894?text=Swim',
    alt: 'Mochi swimming',
  },
];

const formats = [
  { label: 'macOS', icon: IconBrandApple },
  { label: 'GIF / MP4', icon: IconMovie },
  { label: 'More formats', icon: IconLayoutGrid },
];

export function DesktopPetCard() {
  return (
    <section className={`${studioCardClass} overflow-hidden`}>
      <img
        src="https://placehold.co/760x560/f5e3c8/8a6b3f?text=Desktop+Pet"
        alt="Mochi as a desktop pet"
        className="aspect-[19/14] w-full border-b-2 border-deskpet-ink object-cover"
      />
      <div className="flex flex-col gap-3 p-4">
        <CtaButton className="w-full">
          <IconDownload className="size-4" />
          Download for Windows
        </CtaButton>
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => (
            <Button
              key={format.label}
              type="button"
              variant="outline"
              className={`${studioSoftButtonClass} min-w-[96px] flex-1 gap-1.5`}
            >
              <format.icon className="size-3.5" />
              {format.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentCreations() {
  return (
    <section className={`${studioSoftCardClass} p-5`}>
      <StudioCardHeader
        icon={<IconPhoto className="size-[18px] text-deskpet-ink" />}
        accent="bg-deskpet-lavender"
        title="Recent Creations"
        description="Your latest generated memories"
        action="See all"
      />
      <div className="grid grid-cols-3 gap-3">
        {creations.map((item) => (
          <img
            key={item.alt}
            src={item.src}
            alt={item.alt}
            className="aspect-square w-full rounded-xl border-2 border-deskpet-ink/10 object-cover"
          />
        ))}
      </div>
    </section>
  );
}
