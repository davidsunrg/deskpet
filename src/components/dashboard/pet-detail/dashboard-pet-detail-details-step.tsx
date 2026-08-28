import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import { getPetBreedLabel, getPetSpeciesLabel } from '@/utils/pet-catalog';
import { PawPrintIcon } from 'lucide-react';

type DashboardPetDetailDetailsStepProps = {
  avatarUrl: string | null;
  name: string;
  sexLabel: string | null;
  species: string;
  breed: string;
};

export function DashboardPetDetailDetailsStep({
  avatarUrl,
  name,
  sexLabel,
  species,
  breed,
}: DashboardPetDetailDetailsStepProps) {
  const t = useTranslations('DashboardPetDetail');

  return (
    <section
      className={cn(
        dashboardCardClass,
        'flex min-h-0 flex-1 flex-col p-5 sm:p-6'
      )}
    >
      <DashboardCardHeader
        icon={<PawPrintIcon className="size-[18px]" />}
        accent="bg-[#fff2c8]"
        title={t('details.title')}
        description={t('details.description')}
      />
      <div className="grid gap-6">
        <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper/60 p-3 pr-5">
          <PetAvatar src={avatarUrl} alt={name} size="sm" />
          <div className="min-w-0">
            <p className="m-0 truncate font-sans text-lg font-black tracking-tight text-deskpet-ink">
              {name}
            </p>
            {sexLabel ? (
              <p className="mt-0.5 m-0 text-sm font-bold text-deskpet-muted">
                {t('profile.sexLabel')}: {sexLabel}
              </p>
            ) : null}
          </div>
        </div>
        <dl className="m-0 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
              {t('profile.species')}
            </dt>
            <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
              {getPetSpeciesLabel(species)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
              {t('profile.breed')}
            </dt>
            <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
              {getPetBreedLabel(breed)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
