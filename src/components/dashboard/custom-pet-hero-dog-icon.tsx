import { cn } from '@/lib/utils';

type CustomPetHeroDogIconProps = {
  className?: string;
};

/** Dog sketch with heart bubble — used on the Final pricing paywall hero. */
export function CustomPetHeroDogIcon({ className }: CustomPetHeroDogIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public asset
    <img
      src="/dog-sketch.webp"
      alt=""
      aria-hidden
      className={cn('object-contain', className)}
    />
  );
}
