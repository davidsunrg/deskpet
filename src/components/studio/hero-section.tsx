import {
  IconBrandApple,
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconHeartFilled,
  IconLayoutGrid,
  IconMovie,
} from '@tabler/icons-react';
import { handStyle } from './pet-header';

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

export function DesktopPetCard() {
  return (
    <section className="overflow-hidden rounded-[26px] bg-white shadow-[0_2px_12px_rgba(43,38,34,0.05)]">
      {/* Image */}
      <div className="relative">
        <img
          src="https://placehold.co/760x560/f5e3c8/8a6b3f?text=Desktop+Pet"
          alt="Mochi as a desktop pet"
          className="aspect-[19/14] w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <p
          className="absolute top-4 right-5 rotate-[-5deg] text-[20px] leading-[1.1] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
          style={handStyle}
        >
          Your custom
          <br />
          Desktop Pet
        </p>
        <IconHeartFilled className="absolute top-[74px] right-6 size-4 rotate-6 text-[#ff8fa8] drop-shadow" />

        {/* Download bar */}
        <div className="absolute inset-x-4 bottom-4">
          <div className="flex items-center overflow-hidden rounded-2xl bg-[#241f1b]/95 shadow-lg backdrop-blur">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/5"
            >
              <IconDownload className="size-4" strokeWidth={2.2} />
              Download for Windows
            </button>
            <span className="h-6 w-px bg-white/15" />
            <button
              type="button"
              aria-label="Choose platform"
              className="px-3.5 py-3 text-white transition-colors hover:bg-white/5"
            >
              <IconChevronDown className="size-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      {/* Format chips */}
      <div className="flex flex-wrap items-center gap-2.5 p-4 pt-3.5">
        <button
          type="button"
          className="flex min-w-[96px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#faf7f1] px-3 py-2.5 text-[12px] font-medium whitespace-nowrap text-[#5c5248] ring-1 ring-[#f0eadd] transition-colors hover:bg-[#f4efe6]"
        >
          <IconBrandApple className="size-4" strokeWidth={1.8} />
          macOS
        </button>
        <button
          type="button"
          className="flex min-w-[96px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#faf7f1] px-3 py-2.5 text-[12px] font-medium whitespace-nowrap text-[#5c5248] ring-1 ring-[#f0eadd] transition-colors hover:bg-[#f4efe6]"
        >
          <IconMovie className="size-4" strokeWidth={1.8} />
          GIF / MP4
        </button>
        <button
          type="button"
          className="flex min-w-[96px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#faf7f1] px-3 py-2.5 text-[12px] font-medium whitespace-nowrap text-[#5c5248] ring-1 ring-[#f0eadd] transition-colors hover:bg-[#f4efe6]"
        >
          <IconLayoutGrid className="size-4" strokeWidth={1.8} />
          More formats
        </button>
      </div>
    </section>
  );
}

export function RecentCreations() {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_2px_12px_rgba(43,38,34,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#2b2622]">
          Recent Creations
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 text-[12px] font-medium text-[#a2978b] transition-colors hover:text-[#2b2622]"
        >
          See all
          <IconChevronRight className="size-3.5" strokeWidth={2.2} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {creations.map((item) => (
          <img
            key={item.alt}
            src={item.src}
            alt={item.alt}
            className="aspect-square w-full rounded-2xl object-cover"
          />
        ))}
      </div>
    </section>
  );
}
