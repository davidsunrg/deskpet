import {
  IconHeartFilled,
  IconPhoto,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { StudioCardHeader, studioSoftCardClass } from './studio-card';

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
    date: 'Sep 22, 2026',
    title: 'Lazy afternoon',
    subtitle: 'Photo',
    src: 'https://placehold.co/180x140/f2d8b3/8a6b3f?text=Nap',
  },
  {
    kind: 'photo',
    date: 'Sep 20, 2026',
    title: 'A happy day at the beach',
    subtitle: 'Generated photo',
    src: 'https://placehold.co/180x140/d7e8f7/5f7d99?text=Beach',
  },
  {
    kind: 'event',
    date: 'Sep 16, 2026',
    title: 'Joined our family',
    subtitle: 'Special day',
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
];

const waveBars = [
  10, 16, 24, 14, 28, 18, 32, 22, 12, 26, 34, 20, 14, 24, 30, 16, 10, 20, 28,
  12, 18, 8,
];

function MemoryMedia({ memory }: { memory: Memory }) {
  if (memory.kind === 'event') {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-deskpet-ink bg-deskpet-pink/30">
        <IconHeartFilled className="size-5 text-deskpet-ink" />
      </span>
    );
  }
  if (memory.kind === 'voice') {
    return (
      <span className="flex h-[52px] flex-1 items-center gap-2.5 rounded-xl border-2 border-deskpet-ink/10 bg-white px-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-deskpet-ink bg-deskpet-mint">
          <IconPlayerPlayFilled className="size-3.5 text-deskpet-ink" />
        </span>
        <span className="flex h-8 flex-1 items-center gap-[2.5px]">
          {waveBars.map((height, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-deskpet-ink/25"
              style={{ height: `${height}px` }}
            />
          ))}
        </span>
        <span className="text-[11px] font-semibold text-deskpet-muted">
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
        className="h-[52px] w-[72px] rounded-lg border-2 border-deskpet-ink/10 object-cover"
      />
      {memory.kind === 'video' && (
        <>
          <span className="absolute inset-0 grid place-items-center rounded-lg bg-black/20">
            <span className="grid size-5 place-items-center rounded-full bg-white/90">
              <IconPlayerPlayFilled className="size-2.5 text-deskpet-ink" />
            </span>
          </span>
          <span className="absolute right-1 bottom-1 rounded-md bg-deskpet-ink/70 px-1 py-px text-[9px] font-medium text-white">
            {memory.duration}
          </span>
        </>
      )}
    </span>
  );
}

export function MemoriesCard() {
  return (
    <section className={`${studioSoftCardClass} flex h-full flex-col p-5`}>
      <StudioCardHeader
        icon={<IconPhoto className="size-[18px] text-deskpet-ink" />}
        accent="bg-deskpet-mint-soft"
        title="Memories"
        description="Every moment with Mochi"
        action="See all"
      />

      {/* Timeline */}
      <ol className="relative flex-1">
        <span className="absolute top-1 bottom-2 left-[5px] w-0.5 bg-deskpet-ink/10" />
        {memories.map((memory, index) => (
          <li
            key={`${memory.date}-${memory.title}`}
            className={`relative pl-6 ${index === memories.length - 1 ? '' : 'pb-5'}`}
          >
            <span className="absolute top-[3px] left-0 size-[11px] rounded-full border-2 border-deskpet-ink/40 bg-deskpet-paper" />
            <p className="text-[10.5px] font-semibold text-deskpet-muted">
              {memory.date}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <MemoryMedia memory={memory} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-deskpet-ink">
                  {memory.title}
                </p>
                <p className="mt-0.5 text-[11px] text-deskpet-muted">
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
