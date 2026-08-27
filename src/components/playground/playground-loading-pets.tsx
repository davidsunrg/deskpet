import { LoaderIcon } from 'lucide-react';
import { useTranslations } from '@/lib/deskpet-i18n';

/**
 * Centered status overlay for the wallpaper shell while pets/chrome load.
 */
export function PlaygroundLoadingPets() {
  const t = useTranslations('Pets');

  return (
    <output
      className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 text-current">
        <LoaderIcon className="size-8 animate-spin opacity-70" aria-hidden />
        <span className="text-sm font-medium tracking-wide opacity-70">
          {t('loadingPets')}
        </span>
      </div>
    </output>
  );
}
