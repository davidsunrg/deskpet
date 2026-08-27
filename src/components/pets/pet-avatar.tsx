import { cn } from '@/lib/utils';
import { PawPrintIcon } from 'lucide-react';

const PET_AVATAR_SIZE_CLASS = {
  /** Marketing header / sidebar trigger */
  xs: 'size-8 border-2',
  /** Compact summary chips */
  sm: 'size-14 border-[3px]',
  /** Creator Actions hero */
  md: 'size-[72px] border-4 sm:size-24',
  /** Creator Basics editor */
  lg: 'size-32 border-4',
  /** Dashboard active-pet overview */
  xl: 'size-[140px] border-4 sm:size-[160px]',
} as const;

const PET_AVATAR_ICON_CLASS = {
  xs: 'size-3.5',
  sm: 'size-6',
  md: 'size-9',
  lg: 'size-16',
  xl: 'size-20',
} as const;

export type PetAvatarSize = keyof typeof PET_AVATAR_SIZE_CLASS;

type PetAvatarProps = {
  src?: string | null;
  alt?: string;
  size?: PetAvatarSize;
  className?: string;
};

/**
 * Square pet avatar used across marketing, dashboard, and creator surfaces.
 * Soft corner radius, white ring, green fallback, soft shadow.
 */
export function PetAvatar({
  src,
  alt = '',
  size = 'md',
  className,
}: PetAvatarProps) {
  return (
    <div
      className={cn(
        'flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-md border-white bg-[#12875f]',
        PET_AVATAR_SIZE_CLASS[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- may be blob URL or remote CDN
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <PawPrintIcon
          className={cn('text-white', PET_AVATAR_ICON_CLASS[size])}
          aria-hidden
        />
      )}
    </div>
  );
}
