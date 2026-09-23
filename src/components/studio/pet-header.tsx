import {
  IconDots,
  IconHeartFilled,
  IconLink,
  IconPawFilled,
  IconPencil,
} from '@tabler/icons-react';

export const handStyle: React.CSSProperties = {
  fontFamily: "'Caveat', 'Segoe Script', cursive",
};

function DogSketch() {
  return (
    <svg
      viewBox="0 0 120 110"
      fill="none"
      stroke="#d9b78c"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[92px] w-[100px]"
      aria-hidden="true"
    >
      {/* left ear */}
      <path d="M38 46 C 24 40, 20 20, 28 14 C 40 18, 44 32, 44 42" />
      {/* right ear */}
      <path d="M82 46 C 96 40, 100 20, 92 14 C 80 18, 76 32, 76 42" />
      {/* head */}
      <path d="M38 46 C 36 76, 46 92, 60 92 C 74 92, 84 76, 82 46" />
      <path d="M44 42 C 46 30, 52 26, 60 26 C 68 26, 74 30, 76 42" />
      {/* eyes */}
      <circle cx="50" cy="58" r="1.5" fill="#d9b78c" stroke="none" />
      <circle cx="70" cy="58" r="1.5" fill="#d9b78c" stroke="none" />
      {/* snout + nose */}
      <path d="M54 66 C 54 74, 66 74, 66 66" />
      <path d="M56 66 C 56 62, 64 62, 64 66" fill="#d9b78c" />
      {/* tongue */}
      <path d="M58 78 C 58 84, 62 84, 62 78" />
      {/* body hint */}
      <path d="M36 96 C 48 104, 72 104, 84 96" />
    </svg>
  );
}

export function PetHeader() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_2px_12px_rgba(43,38,34,0.05)] sm:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
        {/* Avatar + info */}
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <img
            src="https://placehold.co/240x240/f2d8b3/8a6b3f?text=Mochi"
            alt="Mochi"
            className="size-[88px] shrink-0 rounded-[20px] object-cover sm:size-[110px] sm:rounded-[22px]"
          />

          {/* Info */}
          <div className="min-w-0 pt-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[24px] font-bold tracking-tight text-[#2b2622] sm:text-[28px]">
                Mochi
              </h1>
              <IconPencil className="size-4 text-[#b3a89b]" strokeWidth={2} />
            </div>
            <p className="mt-1 text-[12.5px] text-[#8a7f74]">
              Golden Retriever <span className="mx-1.5 text-[#d8cfc2]">·</span>{' '}
              3 years old <span className="mx-1.5 text-[#d8cfc2]">·</span> Since
              2023.06.12
            </p>
            <p className="mt-3.5 flex items-center gap-2 text-[13px] text-[#5c5248]">
              My sunshine. Thank you for being in my life.
              <IconHeartFilled className="size-4 shrink-0 text-[#ff6b8a]" />
            </p>
          </div>
        </div>

        {/* Decorative right side */}
        <div className="relative flex shrink-0 items-end justify-between gap-4 md:ml-auto md:items-start md:gap-6 md:self-stretch md:pr-1">
          <div className="flex flex-col items-start pt-0.5 md:items-end">
            <p
              className="rotate-[-4deg] text-left text-[19px] leading-[1.15] text-[#4a423a] md:text-right"
              style={handStyle}
            >
              Same pet,
              <br />
              More memories.
              <br />
              Always with you.
            </p>
            <IconHeartFilled className="mt-1 mr-1 size-4 self-end text-[#ff6b8a]" />
            <IconPawFilled className="mt-6 hidden size-7 rotate-[-18deg] text-[#e8cba2] md:block" />
          </div>

          <div className="flex flex-col items-end justify-between gap-3 md:items-center md:self-stretch md:pb-1">
            <div className="hidden sm:block">
              <DogSketch />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-[#2b2622] shadow-[0_1px_4px_rgba(43,38,34,0.1)] ring-1 ring-[#efe9df] transition-colors hover:bg-[#faf7f1]"
              >
                <IconLink className="size-3.5" strokeWidth={2.2} />
                Share Mochi
              </button>
              <button
                type="button"
                aria-label="More options"
                className="flex size-9 items-center justify-center rounded-full bg-white text-[#6f655c] shadow-[0_1px_4px_rgba(43,38,34,0.1)] ring-1 ring-[#efe9df] transition-colors hover:bg-[#faf7f1]"
              >
                <IconDots className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
