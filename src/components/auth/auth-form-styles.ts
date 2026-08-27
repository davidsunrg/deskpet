import { cn } from '@/lib/utils';

export const authFieldClass =
  'h-11 rounded-lg border-deskpet-ink/20 bg-background px-3 text-sm shadow-none';

export const authSubmitClass =
  'flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-deskpet-ink bg-deskpet-ink text-sm font-semibold text-white hover:bg-deskpet-ink/90 dark:border-foreground dark:bg-foreground dark:text-background';

export function authLabelClass(visible = false) {
  return cn(visible ? 'text-sm text-deskpet-ink' : 'sr-only');
}
