import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * Copy of the dashboard card idioms (`dashboard-card.tsx`) for studio.
 */
export const studioCardClass =
  'rounded-[22px] border-2 border-deskpet-ink bg-white shadow-[5px_6px_0_rgba(56,42,53,0.12)]';

export const studioSoftCardClass =
  'rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper shadow-[4px_4px_0_0_rgba(55,39,51,0.06)]';

export const studioSoftButtonClass =
  'min-h-9 rounded-full border-2 border-deskpet-ink/14 bg-white px-3 text-[11px] font-black text-deskpet-ink shadow-none hover:bg-[#fff9ee]';

export function StudioCardHeader({
  icon,
  accent,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  accent: string;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="mb-[18px] flex items-center justify-between gap-3.5">
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'grid size-[38px] place-items-center rounded-xl border-2 border-deskpet-ink',
            accent
          )}
        >
          {icon}
        </div>
        <div>
          <h2 className="mb-0.5 text-[17px] tracking-[-0.025em] text-deskpet-ink">
            {title}
          </h2>
          <p className="m-0 text-[11px] text-deskpet-muted">{description}</p>
        </div>
      </div>
      {action ? (
        <Button
          type="button"
          variant="outline"
          className={studioSoftButtonClass}
        >
          {action}
        </Button>
      ) : null}
    </div>
  );
}
