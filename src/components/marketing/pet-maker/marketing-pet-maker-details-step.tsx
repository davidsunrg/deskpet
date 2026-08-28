import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/lib/deskpet-i18n';
import { cn } from '@/lib/utils';
import {
  getPetBreedLabel,
  getPetSpeciesLabel,
  listPetBreedsForSpecies,
  PET_SPECIES_VALUES,
  PetSex,
  type PetBreed,
  type PetSpecies,
  speciesUsesBreeds,
} from '@/utils/pet-catalog';
import { PawPrintIcon } from 'lucide-react';

type MarketingPetMakerDetailsStepProps = {
  displayAvatarUrl: string | null;
  petName: string;
  sex: PetSex | '';
  species: PetSpecies | '';
  breed: PetBreed | '';
  onSpeciesChange: (value: string) => void;
  onBreedChange: (value: string) => void;
};

export function MarketingPetMakerDetailsStep({
  displayAvatarUrl,
  petName,
  sex,
  species,
  breed,
  onSpeciesChange,
  onBreedChange,
}: MarketingPetMakerDetailsStepProps) {
  const t = useTranslations('MarketingPetMaker');
  const sexLabel =
    sex === PetSex.Male
      ? t('sex.male')
      : sex === PetSex.Female
        ? t('sex.female')
        : null;
  const breedOptions = species ? listPetBreedsForSpecies(species) : [];
  const showBreed = species ? speciesUsesBreeds(species) : false;

  return (
    <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
      <DashboardCardHeader
        icon={<PawPrintIcon className="size-[18px]" />}
        accent="bg-[#fff2c8]"
        title={t('details.title')}
        description={t('details.description')}
      />
      <div className="grid gap-6">
        <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper/60 p-3 pr-5">
          <PetAvatar src={displayAvatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="m-0 truncate font-sans text-lg font-black tracking-tight text-deskpet-ink">
              {petName || t('profile.unnamedPet')}
            </p>
            {sexLabel ? (
              <p className="mt-0.5 m-0 text-sm font-bold text-deskpet-muted">
                {t('profile.sexLabel')}: {sexLabel}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="marketing-maker-species">
              {t('profile.species')}
            </Label>
            <Select value={species} onValueChange={onSpeciesChange}>
              <SelectTrigger
                id="marketing-maker-species"
                className="!h-11 w-full"
              >
                <SelectValue placeholder={t('profile.speciesPlaceholder')} />
              </SelectTrigger>
              <SelectContent
                translate="no"
                data-google-translate="no"
                className="notranslate"
              >
                {PET_SPECIES_VALUES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {getPetSpeciesLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showBreed ? (
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="marketing-maker-breed">
                {t('profile.breed')}
              </Label>
              <Select value={breed} onValueChange={onBreedChange}>
                <SelectTrigger
                  id="marketing-maker-breed"
                  className="!h-11 w-full"
                >
                  <SelectValue placeholder={t('profile.breedPlaceholder')} />
                </SelectTrigger>
                <SelectContent
                  translate="no"
                  data-google-translate="no"
                  className="notranslate"
                >
                  {breedOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {getPetBreedLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
