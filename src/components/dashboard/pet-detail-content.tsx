'use client';

import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { formatDate, formatDateTime } from '@/lib/formatter';
import { useTranslations } from '@/lib/deskpet-i18n';
import { getFileAccessUrl } from '@/lib/urls';
import { cn } from '@/lib/utils';
import {
  getPetBreedLabel,
  getPetSpeciesLabel,
  PetSex,
} from '@/utils/pet-catalog';
import {
  WIZARD_STEPS,
  type WizardStep,
} from '@/utils/pets/pet-maker-wizard-steps';
import { ImageIcon, PawPrintIcon } from 'lucide-react';
import { useState } from 'react';

export type UserPetDetail = {
  id: string;
  name: string;
  species: string;
  breed: string;
  sex: string | null;
  avatar: string | null;
  photoKeys: string[];
  createdAt: Date;
  updatedAt: Date;
};

type PetDetailContentProps = {
  pet: UserPetDetail;
};

function getSexLabel(sex: string | null): string | null {
  if (sex === PetSex.Male) return 'Male';
  if (sex === PetSex.Female) return 'Female';
  return null;
}

export function PetDetailContent({ pet }: PetDetailContentProps) {
  const t = useTranslations('CreatePetWizard');
  const [step, setStep] = useState<WizardStep>('photos');

  const avatarUrl = pet.avatar ? getFileAccessUrl(pet.avatar) : null;
  const sexLabel = getSexLabel(pet.sex);
  const photoUrls = pet.photoKeys.map((key) => getFileAccessUrl(key));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
      <nav aria-label="Pet detail steps" className="shrink-0 lg:w-52">
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
          {WIZARD_STEPS.map((item, index) => {
            const active = item === step;
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => setStep(item)}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold transition-colors',
                    active
                      ? 'bg-deskpet-mint text-deskpet-ink'
                      : 'cursor-pointer text-deskpet-ink hover:bg-deskpet-mint-soft'
                  )}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-deskpet-ink">
                    {index + 1}
                  </span>
                  {t(`steps.${item}`)}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-w-0 flex-1">
        {step === 'photos' ? (
          <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
            <DashboardCardHeader
              icon={<ImageIcon className="size-[18px]" />}
              accent="bg-deskpet-mint-soft"
              title={t('photos.title')}
              description={t('photos.description')}
            />
            {photoUrls.length === 0 ? (
              <p className="m-0 text-sm text-deskpet-muted">
                No reference photos saved for this pet.
              </p>
            ) : (
              <ul className="mt-4 m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
                {photoUrls.map((url, index) => (
                  <li key={pet.photoKeys[index] ?? index} className="min-w-0">
                    <div className="aspect-square overflow-hidden rounded-2xl border-2 border-deskpet-ink/12 bg-deskpet-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element -- storage proxy URL */}
                      <img
                        src={url}
                        alt={`Reference ${index + 1}`}
                        className="size-full object-contain"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {step === 'basics' ? (
          <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
            <DashboardCardHeader
              icon={<PawPrintIcon className="size-[18px]" />}
              accent="bg-[#fff2c8]"
              title={t('basics.title')}
              description={t('basics.description')}
            />
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <PetAvatar src={avatarUrl} alt={pet.name} size="lg" />
                <div className="min-w-0 grid gap-2">
                  <div>
                    <p className="m-0 text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                      {t('profile.nameLabel')}
                    </p>
                    <p className="m-0 mt-1 text-xl font-black text-deskpet-ink">
                      {pet.name}
                    </p>
                  </div>
                  {sexLabel ? (
                    <div>
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                        {t('profile.sexLabel')}
                      </p>
                      <p className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
                        {sexLabel}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
              <dl className="m-0 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                    Created
                  </dt>
                  <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
                    {formatDate(pet.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                    Updated
                  </dt>
                  <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
                    {formatDateTime(pet.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        ) : null}

        {step === 'details' ? (
          <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
            <DashboardCardHeader
              icon={<PawPrintIcon className="size-[18px]" />}
              accent="bg-[#fff2c8]"
              title={t('details.title')}
              description={t('details.description')}
            />
            <div className="grid gap-6">
              <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper/60 p-3 pr-5">
                <PetAvatar src={avatarUrl} alt={pet.name} size="sm" />
                <div className="min-w-0">
                  <p className="m-0 truncate font-sans text-lg font-black tracking-tight text-deskpet-ink">
                    {pet.name}
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
                    {getPetSpeciesLabel(pet.species)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-deskpet-muted">
                    {t('profile.breed')}
                  </dt>
                  <dd className="m-0 mt-1 text-sm font-semibold text-deskpet-ink">
                    {getPetBreedLabel(pet.breed)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
