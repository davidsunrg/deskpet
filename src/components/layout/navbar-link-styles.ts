import { cn } from '@/lib/utils';

export function desktopNavLinkClass(active?: boolean) {
  return cn(
    'relative inline-flex items-center gap-1 px-1 py-2 text-[15px] font-bold text-deskpet-ink',
    'after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-deskpet-mint after:transition-transform',
    'hover:after:scale-x-100',
    active && 'after:scale-x-100'
  );
}

export const mobileNavLinkClass =
  'flex w-full items-center rounded-lg px-2.5 py-2.5 text-[15px] font-bold text-deskpet-muted transition-colors hover:bg-deskpet-mint-soft hover:text-deskpet-ink';

export const mobileNavLinkActiveClass = 'bg-deskpet-mint-soft text-deskpet-ink';

export const mobileNavSubLinkClass =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-bold text-deskpet-muted transition-colors hover:bg-deskpet-mint-soft hover:text-deskpet-ink';
