import {
  IconChevronRight,
  IconHeartFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';

type Memory =
  | {
      kind: 'photo';
      date: string;
      title: string;
      subtitle: string;
      src: string;
    }
  | {
      kind: 'video';
      date: string;
      title: string;
      subtitle: string;
      src: string;
      duration: string;
    }
  | {
      kind: 'voice';
      date: string;
      title: string;
      subtitle: string;
      duration: string;
    }
  | { kind: 'event'; date: string; title: string; subtitle: string };

const memories: Memory[] = [
  {
    kind: 'photo',
    date: 'Sep 20, 2026',
    title: 'A happy day at the beach',
    subtitle: 'Generated photo',
    src: 'https://placehold.co/180x140/d7e8f7/5f7d99?text=Beach',
  },
  {
    kind: 'photo',
    date: 'Sep 15, 2026',
    title: 'Exploring the mountains',
    subtitle: 'Generated photo',
    src: 'https://placehold.co/180x140/dfe8d3/6b7f57?text=Hike',
  },
  {
    kind: 'video',
    date: 'Sep 10, 2026',
    title: 'Running in the park',
    subtitle: 'Generated video',
    duration: '00:15',
    src: 'https://placehold.co/180x140/f5e3c8/8a6b3f?text=Park',
  },
  {
    kind: 'voice',
    date: 'Sep 05, 2026',
    title: "Mochi's bark",
    subtitle: 'Voice recording',
    duration: '00:24',
  },
  {
    kind: 'photo',
    date: 'Aug 28, 2026',
    title: 'Lazy afternoon',
    subtitle: 'Photo',
    src: 'https://placehold.co/180x140/f2d8b3/8a6b3f?text=Nap',
  },
  {
    kind: 'event',
    date: 'Aug 12, 2026',
    title: 'Joined our family',
    subtitle: 'Special day',
  },
];

const waveBars = [
  10, 16, 24, 14, 28, 18, 32, 22, 12, 26, 34, 20, 14, 24, 30, 16, 10, 20, 28,
  12, 18, 8,
];

function MemoryMedia({ memory }: { memory: Memory }) {
  if (memory.kind === 'event') {
    return (
      <span className="flex size-10 items-center justify-center rounded-full bg-[#ffeef3]">
        <IconHeartFilled className="size-5 text-[#ff5c8a]" />
      </span>
    );
  }
  if (memory.kind === 'voice') {
    return (
      <span className="flex h-[52px] flex-1 items-center gap-2.5 rounded-2xl bg-[#f4f8ff] px-3 ring-1 ring-[#e5eeff]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#3b82f6]">
          <IconPlayerPlayFilled className="size-3.5 text-white" />
        </span>
        <span className="flex h-8 flex-1 items-center gap-[2.5px]">
          {waveBars.map((height, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[#7db0ff]"
              style={{ height: `${height}px` }}
            />
          ))}
        </span>
        <span className="text-[11px] font-medium text-[#8a9bbf]">
          {memory.duration}
        </span>
      </span>
    );
  }
  return (
    <span className="relative shrink-0">
      <img
        src={memory.src}
        alt={memory.title}
        className="h-[52px] w-[72px] rounded-xl object-cover"
      />
      {memory.kind === 'video' && (
        <>
          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
            <span className="flex size-5 items-center justify-center rounded-full bg-white/90">
              <IconPlayerPlayFilled className="size-2.5 text-[#2b2622]" />
            </span>
          </span>
          <span className="absolute right-1 bottom-1 rounded-md bg-black/60 px-1 py-px text-[9px] font-medium text-white">
            {memory.duration}
          </span>
        </>
      )}
    </span>
  );
}

export function MemoriesCard() {
  return (
    <section className="flex h-full flex-col rounded-[26px] bg-white p-5 shadow-[0_2px_12px_rgba(43,38,34,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#2b2622]">
          <span className="flex size-6 items-center justify-center rounded-md bg-[#f4f0ff]">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c5cf0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </span>
          Memories
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 text-[12px] font-medium text-[#a2978b] transition-colors hover:text-[#2b2622]"
        >
          See all
          <IconChevronRight className="size-3.5" strokeWidth={2.2} />
        </button>
      </div>

      {/* Timeline */}
      <ol className="relative mt-5 flex-1">
        <span className="absolute top-1 bottom-2 left-[5px] w-px bg-[#efe9df]" />
        {memories.map((memory, index) => (
          <li
            key={`${memory.date}-${memory.title}`}
            className={`relative pl-6 ${index === memories.length - 1 ? '' : 'pb-5'}`}
          >
            <span className="absolute top-[3px] left-0 size-[11px] rounded-full border-2 border-[#c9b8f5] bg-white" />
            <p className="text-[10.5px] font-medium text-[#b3a89b]">
              {memory.date}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <MemoryMedia memory={memory} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#2b2622]">
                  {memory.title}
                </p>
                <p className="mt-0.5 text-[11px] text-[#a2978b]">
                  {memory.subtitle}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
