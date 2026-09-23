import { Button } from '@/components/ui/button';
import {
  IconDots,
  IconHeartFilled,
  IconLink,
  IconPencil,
} from '@tabler/icons-react';
import { studioCardClass, studioSoftButtonClass } from './studio-card';

export function PetHeader() {
  return (
    <section className={`${studioCardClass} p-5 sm:p-6`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <img
            src="https://placehold.co/240x240/f2d8b3/8a6b3f?text=Mochi"
            alt="Mochi"
            className="size-[72px] shrink-0 rounded-2xl border-2 border-deskpet-ink object-cover sm:size-[88px]"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-deskpet-ink">
                Mochi
              </h1>
              <IconPencil className="size-4 text-deskpet-muted" />
            </div>
            <p className="mt-1 text-[13px] font-semibold text-deskpet-muted">
              Golden Retriever · 3 years old · Since 2023.06.12
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[13px] text-deskpet-muted">
              My sunshine. Thank you for being in my life.
              <IconHeartFilled className="size-3.5 shrink-0 text-deskpet-pink" />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" className={studioSoftButtonClass}>
            <IconLink className="size-3.5" />
            Share Mochi
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="More options"
            className={`${studioSoftButtonClass} px-2.5`}
          >
            <IconDots className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
