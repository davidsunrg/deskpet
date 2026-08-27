import { buttonVariants } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { PawPrintIcon } from 'lucide-react';

export function AdoptPetRequiredEmpty() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-deskpet-paper px-6 py-12">
      <section className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-2.5 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-[#155b43]">
          <PawPrintIcon className="size-3.5" />
          Adopt a pet
        </div>
        <h1 className="mb-3 text-[clamp(34px,4vw,48px)] leading-none font-black tracking-[-0.055em] text-deskpet-ink">
          Bring your first desk pet home
        </h1>
        <p className="m-0 max-w-[520px] text-sm leading-relaxed text-deskpet-muted">
          Adopt a preset from the catalog or create a custom pet to unlock your
          dashboard.
        </p>
        <div className="mt-7 flex flex-row flex-wrap items-center justify-center gap-4">
          <LocaleLink
            href={Routes.Pets}
            className={cn(
              buttonVariants({ variant: 'brutalOutline', size: 'lg' }),
              'h-11 px-6'
            )}
          >
            Browse pets
          </LocaleLink>
          <LocaleLink
            href={Routes.DesktopPetCreator}
            className={cn(
              buttonVariants({ variant: 'brutal', size: 'lg' }),
              'h-11 px-6'
            )}
          >
            Create my own
          </LocaleLink>
        </div>
      </section>
    </div>
  );
}
