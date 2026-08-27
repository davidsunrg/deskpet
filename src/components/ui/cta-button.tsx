import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import type { ComponentProps } from 'react';

type CtaButtonProps = Omit<ComponentProps<typeof Button>, 'variant'> & {
  /**
   * Brand CTAs: `brutal` (green save/primary), `brutalOutline` (neutral cancel),
   * or `brutalSecondary` (sun accent). Same size/shape; color differs.
   */
  variant?: 'brutal' | 'brutalOutline' | 'brutalSecondary';
};

/** Equal width for Cancel + Save pairs outside DialogFooter. */
export const ctaPairButtonClassName = 'min-w-24';

/**
 * Shared DeskPet CTA button — green mint primary by default.
 * Pair Cancel with `variant="brutalOutline"` so shape matches Save.
 */
export function CtaButton({
  className,
  variant = 'brutal',
  size = 'lg',
  ...props
}: CtaButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('min-h-11 gap-2 px-4 text-[13px]', className)}
      {...props}
    />
  );
}
