import { CtaButton } from '@/components/ui/cta-button';
import {
  IconAdjustments,
  IconChevronRight,
  IconHeartFilled,
  IconPaw,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { studioCardClass, studioSoftCardClass } from './studio-card';

export function InteractivePetCard() {
  return (
    <section className={`${studioCardClass} p-5`}>
      <div className="mb-[18px] flex items-center gap-2.5">
        <div className="grid size-[38px] place-items-center rounded-xl border-2 border-deskpet-ink bg-deskpet-cream">
          <IconPaw className="size-[18px] text-deskpet-ink" />
        </div>
        <div>
          <h2 className="mb-0.5 text-[17px] tracking-[-0.025em] text-deskpet-ink">
            Interactive DeskPet
          </h2>
          <p className="m-0 text-[11px] text-deskpet-muted">
            Mochi lives on your desktop
          </p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-deskpet-muted">
          <span className="size-2 rounded-full border border-deskpet-ink/20 bg-deskpet-mint" />
          Online
        </span>
      </div>

      {/* Scene */}
      <div className="relative overflow-hidden rounded-xl border-2 border-deskpet-ink/10">
        <img
          src="https://placehold.co/640x420/f5e3c8/8a6b3f?text=On+your+desk"
          alt="Mochi sitting on the desk"
          className="aspect-[8/5] w-full object-cover"
        />
        {/* Speech bubble */}
        <div className="absolute top-3 right-3 max-w-[140px] rounded-xl border-2 border-deskpet-ink/15 bg-white px-3.5 py-2.5 text-[12px] font-bold text-deskpet-ink shadow-[3px_3px_0_rgba(56,42,53,0.12)]">
          Woof! I'm always here for you!
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CtaButton className="min-w-36 flex-1">
          <IconPlayerPlayFilled className="size-4" />
          Play Animation
        </CtaButton>
        <CtaButton variant="brutalOutline" className="min-w-36 flex-1">
          <IconAdjustments className="size-4" />
          Customize
        </CtaButton>
      </div>
    </section>
  );
}

export function MemorialCard() {
  return (
    <>
      <button
        type="button"
        className={`${studioSoftCardClass} flex w-full items-center gap-3.5 p-4 text-left transition-transform hover:-translate-y-0.5`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-deskpet-ink bg-deskpet-lavender">
          <IconHeartFilled className="size-5 text-deskpet-ink" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black tracking-tight text-deskpet-ink">
            Memorial Mode
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-deskpet-muted">
            Keep their memory alive, forever.
          </span>
        </span>
        <IconChevronRight className="ml-auto size-4 shrink-0 text-deskpet-muted" />
      </button>

      {/* Quote card */}
      <div className="mt-4 rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-cream p-6 shadow-[4px_4px_0_0_rgba(55,39,51,0.06)]">
        <p className="flex items-center justify-center gap-2 text-center text-sm font-bold text-deskpet-ink">
          Because every moment matters.
          <IconHeartFilled className="size-3.5 shrink-0 text-deskpet-pink" />
        </p>
      </div>
    </>
  );
}
