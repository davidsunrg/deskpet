import { cn } from '@/lib/utils';

/** Matches deskpet-next / references/html nav link underline. */
export function desktopNavLinkClass(active?: boolean) {
  return cn(
    'relative inline-flex h-auto items-center gap-1 rounded-none bg-transparent px-0 py-2.5 text-[15px] font-bold text-deskpet-ink shadow-none',
    'hover:bg-transparent hover:text-deskpet-ink focus:bg-transparent focus:text-deskpet-ink',
    'after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[3px] after:h-[3px]',
    'after:origin-center after:scale-x-0 after:rounded-full after:bg-deskpet-mint',
    'after:transition-transform after:duration-[160ms] after:ease-out',
    'hover:after:scale-x-100',
    'data-[state=open]:after:scale-x-100',
    active && 'after:scale-x-100'
  );
}

export const mobileNavLinkClass =
  'flex w-full items-center rounded-md p-2 text-[15px] font-bold text-deskpet-muted transition-colors duration-150 hover:bg-deskpet-mint-soft hover:text-deskpet-ink';

export const mobileNavLinkActiveClass =
  'bg-deskpet-mint-soft font-bold text-deskpet-ink';

export const mobileNavSubLinkClass =
  'flex w-full items-center gap-4 rounded-md p-2 text-[15px] font-bold text-deskpet-muted transition-colors duration-150 hover:bg-deskpet-mint-soft hover:text-deskpet-ink';
