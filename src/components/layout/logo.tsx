import { cn } from '@/lib/utils';
import { PawPrintIcon } from 'lucide-react';

/**
 * DeskPet mark: cream tile + Lucide paw-print.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid size-[38px] shrink-0 place-items-center rounded-xl border-2 border-deskpet-ink bg-[#fff2c8]',
        className
      )}
      title="DeskPet"
      aria-label="DeskPet"
      role="img"
    >
      <PawPrintIcon className="size-[63%] text-deskpet-ink" aria-hidden />
    </div>
  );
}
