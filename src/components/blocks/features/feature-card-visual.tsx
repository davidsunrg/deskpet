import { cn } from '@/utils/cn';

export type FeatureCardId =
  | 'item-1'
  | 'item-2'
  | 'item-3'
  | 'item-4'
  | 'item-5'
  | 'item-6';

const VISUAL_WASH: Record<FeatureCardId, string> = {
  'item-1': '#def7ed',
  'item-2': '#eee5ff',
  'item-3': '#ffe7ec',
  'item-4': '#fff2c8',
  'item-5': '#e5f3ff',
  'item-6': '#def7ed',
};

/**
 * Mini UI illustration for a feature card (from references/html/features.html).
 */
export function FeatureCardVisual({
  id,
  className,
}: {
  id: FeatureCardId;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative z-[1] mb-4 h-[170px] shrink-0 overflow-hidden rounded-[22px] border-2 border-deskpet-ink dark:border-border',
        className
      )}
      style={{
        background: [
          'radial-gradient(circle at 82% 18%, rgba(159,122,234,.18), transparent 26%)',
          'radial-gradient(circle at 15% 82%, rgba(85,217,170,.2), transparent 28%)',
          `linear-gradient(145deg, ${VISUAL_WASH[id]}, #fff 78%)`,
        ].join(', '),
      }}
      data-feature-illustration={id}
    >
      {id === 'item-1' ? <LibraryVisual /> : null}
      {id === 'item-2' ? <InteractionVisual /> : null}
      {id === 'item-3' ? <HealthVisual /> : null}
      {id === 'item-4' ? <ExpenseVisual /> : null}
      {id === 'item-5' ? <InventoryVisual /> : null}
      {id === 'item-6' ? <MemoryVisual /> : null}
    </div>
  );
}

function LibraryVisual() {
  const tiles: Array<{ emoji: string; bg: string; active?: boolean }> = [
    { emoji: '🐈', bg: 'bg-[#fff2c8]', active: true },
    { emoji: '🐕', bg: 'bg-[#eee5ff]' },
    { emoji: '🦮', bg: 'bg-[#def7ed]' },
    { emoji: '🐈‍⬛', bg: 'bg-[#ffe7ec]' },
    { emoji: '🐕‍🦺', bg: 'bg-[#e5f3ff]' },
    { emoji: '＋', bg: 'bg-[#fff0dc]' },
  ];

  return (
    <div className="absolute inset-[15px] rounded-[18px] border-2 border-deskpet-ink bg-white/95 p-3.5 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border dark:bg-card/95">
      <div className="flex items-center justify-between border-b-2 border-dashed border-deskpet-ink/15 pb-2 dark:border-border">
        <div className="flex gap-1.5">
          <span className="size-[9px] rounded-full border-2 border-deskpet-ink bg-[#ef8ea3] dark:border-border" />
          <span className="size-[9px] rounded-full border-2 border-deskpet-ink bg-[#ffd767] dark:border-border" />
          <span className="size-[9px] rounded-full border-2 border-deskpet-ink bg-[#55d9aa] dark:border-border" />
        </div>
        <span className="rounded-full border-2 border-deskpet-ink/18 bg-[#def7ed] px-2 py-1 text-[9px] font-black text-deskpet-ink dark:border-border dark:text-foreground">
          Choose a companion
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        {tiles.map((tile) => (
          <div
            key={tile.emoji}
            className={cn(
              'grid min-h-12 place-items-center rounded-[13px] border-2 border-deskpet-ink/18 text-[22px] dark:border-border',
              tile.bg,
              tile.active &&
                'border-deskpet-ink shadow-[inset_0_0_0_2px_rgba(85,217,170,0.28)] dark:border-border'
            )}
          >
            {tile.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractionVisual() {
  return (
    <div className="absolute inset-3.5">
      <div className="absolute left-1 top-1 rounded-[999px_999px_999px_7px] border-2 border-deskpet-ink bg-white px-2.5 py-1.5 text-[10px] font-black shadow-[3px_4px_0_0_rgba(56,42,53,0.1)] dark:border-border dark:bg-card">
        Let&apos;s play!
      </div>
      <div className="absolute bottom-1.5 left-5 text-[56px] drop-shadow-[4px_5px_0_rgba(56,42,53,0.1)]">
        🐈
      </div>
      <div className="absolute right-6 top-8 rotate-[-16deg] text-[30px]">
        ➤
      </div>
      <div className="absolute bottom-[18px] right-[22px] h-[52px] w-[96px] rounded-br-[36px] border-b-[3px] border-r-[3px] border-dashed border-deskpet-ink/20 dark:border-border" />
    </div>
  );
}

function HealthVisual() {
  return (
    <div className="absolute inset-3">
      <div className="relative flex h-full flex-col justify-evenly rounded-2xl border-2 border-deskpet-ink bg-white/95 p-3 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border dark:bg-card/95">
        <span className="absolute -top-2.5 right-2.5 z-10 rounded-full border-2 border-[#155b43]/20 bg-[#def7ed] px-1.5 py-0.5 text-[8px] font-black text-[#155b43]">
          All good
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="grid grid-cols-[31px_1fr] items-center gap-1.5 rounded-xl border-2 border-deskpet-ink/18 bg-white p-1.5 dark:border-border dark:bg-card">
            <div className="grid size-[31px] place-items-center rounded-[10px] border-2 border-deskpet-ink bg-[#ffe7ec] text-sm dark:border-border">
              ⚖️
            </div>
            <div className="min-w-0">
              <span className="block text-[7px] font-extrabold text-deskpet-muted">
                Weight
              </span>
              <strong className="mt-0.5 block text-[9px] font-black text-deskpet-ink dark:text-foreground">
                5.4 kg
              </strong>
            </div>
          </div>
          <div className="grid grid-cols-[31px_1fr] items-center gap-1.5 rounded-xl border-2 border-deskpet-ink/18 bg-white p-1.5 dark:border-border dark:bg-card">
            <div className="grid size-[31px] place-items-center rounded-[10px] border-2 border-deskpet-ink bg-[#ffe7ec] text-sm dark:border-border">
              📁
            </div>
            <div className="min-w-0">
              <span className="block text-[7px] font-extrabold text-deskpet-muted">
                Health Records
              </span>
              <strong className="mt-0.5 block text-[9px] font-black text-deskpet-ink dark:text-foreground">
                12 files
              </strong>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[31px_1fr_auto] items-center gap-1.5 rounded-xl border-2 border-deskpet-ink/18 bg-[#eee5ff] p-1.5 dark:border-border">
          <div className="grid size-[31px] place-items-center rounded-[10px] border-2 border-deskpet-ink bg-white text-sm dark:border-border dark:bg-card">
            🔔
          </div>
          <div className="min-w-0">
            <strong className="block text-[9px] font-black text-deskpet-ink dark:text-foreground">
              Eye drops
            </strong>
            <span className="mt-0.5 block text-[7px] text-deskpet-muted">
              Today · 8:00 PM
            </span>
          </div>
          <span className="rounded-full border-2 border-deskpet-ink/12 bg-white px-1.5 py-1 text-[7px] font-black text-deskpet-ink dark:border-border dark:bg-card dark:text-foreground">
            Due
          </span>
        </div>
      </div>
    </div>
  );
}

function ExpenseVisual() {
  return (
    <div className="absolute inset-3.5 rounded-2xl border-2 border-deskpet-ink bg-white/95 p-3 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border dark:bg-card/95">
      <div className="flex justify-between gap-3 text-[10px] font-black text-deskpet-ink dark:text-foreground">
        <span>July spending</span>
        <span>Budget $420</span>
      </div>
      <div className="my-2 text-[26px] font-black tracking-[-0.05em] text-deskpet-ink dark:text-foreground">
        $286.40
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border-2 border-deskpet-ink bg-white dark:border-border">
        <span
          className="block h-full w-[68%]"
          style={{
            background:
              'repeating-linear-gradient(-45deg, #ffd767, #ffd767 7px, rgba(255,255,255,.45) 7px, rgba(255,255,255,.45) 14px)',
          }}
        />
      </div>
      <div className="mt-2 grid gap-1 text-[8px] text-deskpet-muted">
        <div className="flex justify-between gap-2">
          <span>Vet care</span>
          <strong className="text-deskpet-ink dark:text-foreground">
            $128
          </strong>
        </div>
        <div className="flex justify-between gap-2">
          <span>Food</span>
          <strong className="text-deskpet-ink dark:text-foreground">$96</strong>
        </div>
      </div>
    </div>
  );
}

function InventoryVisual() {
  return (
    <div className="absolute inset-3.5">
      <div className="absolute left-0.5 top-1 w-[72%] -rotate-[2.5deg] rounded-[14px] border-2 border-deskpet-ink bg-white p-2.5 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border dark:bg-card">
        <strong className="block text-[10px] font-black text-deskpet-ink dark:text-foreground">
          Chicken wet food
        </strong>
        <span className="mt-1 block text-[8px] text-deskpet-muted">
          8 cans left · expires Sep 18
        </span>
        <div className="mt-2 h-2 overflow-hidden rounded-full border-2 border-deskpet-ink bg-white dark:border-border">
          <span className="block h-full w-[64%] bg-[#8bc7ec]" />
        </div>
      </div>
      <div className="absolute bottom-1 right-0.5 w-[72%] rotate-[2.5deg] rounded-[14px] border-2 border-deskpet-ink bg-[#e5f3ff] p-2.5 shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border">
        <strong className="block text-[10px] font-black text-deskpet-ink dark:text-foreground">
          Flea treatment
        </strong>
        <span className="mt-1 block text-[8px] text-deskpet-muted">
          1 dose left · restock soon
        </span>
        <div className="mt-2 h-2 overflow-hidden rounded-full border-2 border-deskpet-ink bg-white dark:border-border">
          <span className="block h-full w-1/4 bg-[#8bc7ec]" />
        </div>
      </div>
    </div>
  );
}

function MemoryVisual() {
  return (
    <div className="absolute inset-3.5">
      <div className="absolute left-2 top-0.5 grid size-[78px] -rotate-7 place-items-center rounded-[14px] border-2 border-deskpet-ink bg-[#fff2c8] text-[28px] shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border">
        🌿
      </div>
      <div className="absolute right-2 top-3 grid size-[78px] rotate-6 place-items-center rounded-[14px] border-2 border-deskpet-ink bg-[#eee5ff] text-[28px] shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border">
        🐾
      </div>
      <div className="absolute bottom-0 left-1/2 grid size-[78px] -translate-x-1/2 -rotate-1 place-items-center rounded-[14px] border-2 border-deskpet-ink bg-[#def7ed] text-[28px] shadow-[4px_5px_0_0_rgba(56,42,53,0.1)] dark:border-border">
        📷
      </div>
    </div>
  );
}
