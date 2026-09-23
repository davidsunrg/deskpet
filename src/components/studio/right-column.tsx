import {
  IconAdjustments,
  IconChevronRight,
  IconHeartFilled,
  IconPaw,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { handStyle } from './pet-header';

export function InteractivePetCard() {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_2px_12px_rgba(43,38,34,0.05)]">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-[#fff3e3]">
          <IconPaw className="size-3.5 text-[#f2a03d]" strokeWidth={2.2} />
        </span>
        <h2 className="text-[15px] font-bold text-[#2b2622]">
          Interactive DeskPet
        </h2>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[#8a7f74]">
          <span className="size-1.5 rounded-full bg-[#2ecc71]" />
          Online
        </span>
      </div>

      {/* Scene */}
      <div className="relative mt-4 overflow-hidden rounded-2xl">
        <img
          src="https://placehold.co/640x420/f5e3c8/8a6b3f?text=On+your+desk"
          alt="Mochi sitting on the desk"
          className="aspect-[8/5] w-full object-cover"
        />
        {/* Speech bubble */}
        <div className="absolute top-3 right-3 max-w-[130px]">
          <div
            className="rounded-2xl rounded-br-sm bg-white px-3.5 py-2.5 text-[15px] leading-[1.15] text-[#4a423a] shadow-[0_2px_8px_rgba(43,38,34,0.12)]"
            style={handStyle}
          >
            Woof!
            <br />
            I'm always here for you!
          </div>
          <IconHeartFilled className="absolute -right-1 -bottom-1 size-3.5 text-[#ff8fa8]" />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#241f1b] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#3a332e]"
        >
          <IconPlayerPlayFilled className="size-4" />
          Play Animation
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3 text-[13px] font-semibold text-[#2b2622] ring-1 ring-[#e9e2d6] transition-colors hover:bg-[#faf7f1]"
        >
          <IconAdjustments className="size-4" strokeWidth={2} />
          Customize
        </button>
      </div>
    </section>
  );
}

function FlowerSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 36 C 20 26, 20 20, 20 14"
        stroke="#c9b18f"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="10" r="3.5" fill="#f3d9c8" />
      <circle cx="14.5" cy="13" r="3" fill="#f7e6da" />
      <circle cx="25.5" cy="13" r="3" fill="#f7e6da" />
      <circle cx="16" cy="7.5" r="2.6" fill="#fdeee4" />
      <circle cx="24" cy="7.5" r="2.6" fill="#fdeee4" />
      <path
        d="M20 28 C 15 26, 12 23, 12 20 C 16 21, 19 24, 20 28 Z"
        fill="#dfe8d3"
      />
      <path
        d="M20 24 C 25 22, 28 19, 28 16 C 24 17, 21 20, 20 24 Z"
        fill="#e8efdd"
      />
    </svg>
  );
}

export function MemorialCard() {
  return (
    <>
      <button
        type="button"
        className="flex w-full items-center gap-3.5 rounded-[22px] bg-[#f6f2ff] p-4 text-left shadow-[0_1px_6px_rgba(43,38,34,0.04)] ring-1 ring-[#efeafe] transition-shadow hover:shadow-[0_4px_14px_rgba(43,38,34,0.08)]"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <IconHeartFilled className="size-5 text-[#9b6cf0]" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13.5px] font-bold text-[#2b2622]">
            Memorial Mode
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-[#a2978b]">
            Keep their memory alive, forever.
          </span>
        </span>
        <IconChevronRight
          className="ml-auto size-4 shrink-0 text-[#c9bfb2]"
          strokeWidth={2}
        />
      </button>

      {/* Floral quote */}
      <div className="relative mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#fdf6ec] via-[#faf0e6] to-[#f6ece2] p-6 shadow-[0_1px_6px_rgba(43,38,34,0.04)] ring-1 ring-[#f4ece1]">
        <FlowerSprig className="absolute bottom-2 left-2 size-12 opacity-80" />
        <FlowerSprig className="absolute top-2 right-3 size-10 -scale-x-100 opacity-70" />
        <FlowerSprig className="absolute top-6 left-8 size-7 opacity-50" />
        <div className="relative py-4 text-center">
          <p
            className="text-[21px] leading-[1.25] text-[#7a6a58]"
            style={handStyle}
          >
            Because
            <br />
            every moment matters.
          </p>
          <IconHeartFilled className="absolute top-1 right-10 size-3.5 rotate-12 text-[#f5a9b8]" />
          <IconHeartFilled className="absolute bottom-0 left-12 size-3 -rotate-12 text-[#f7cdd6]" />
        </div>
      </div>
    </>
  );
}
