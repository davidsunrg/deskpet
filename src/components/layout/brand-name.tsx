'use client';

import { cn } from '@/utils/cn';

type BrandNameProps = {
  className?: string;
};

/**
 * Brand wordmark: DeskPet.ai — ink text + mint .ai (#7adcaa).
 */
export function BrandName({ className }: BrandNameProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-sans text-2xl font-black tracking-[-0.04em] text-[#382A35] dark:text-foreground',
        className
      )}
      aria-label="DeskPet.ai"
    >
      DeskPet
      <span className="text-[#7adcaa]">.ai</span>
    </span>
  );
}
