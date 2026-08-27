import { cn } from '@/lib/utils';

export const authFieldClass =
  'h-11 rounded-lg border-deskpet-ink/20 bg-white shadow-none';

export const authSubmitClass =
  'h-11 w-full rounded-lg bg-deskpet-ink font-mono text-sm font-black text-white hover:bg-deskpet-ink/90';

export const authOutlineButtonClass =
  'h-11 w-full rounded-lg border-deskpet-ink/20 bg-white font-mono text-sm font-black text-deskpet-ink hover:bg-deskpet-mint-soft';

export function authLabelClass(visible = false) {
  return cn(visible ? 'text-sm font-bold text-deskpet-ink' : 'sr-only');
}
