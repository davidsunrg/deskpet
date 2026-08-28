import {
  dashboardCardClass,
  DashboardCardHeader,
} from '@/components/dashboard/dashboard-card';
import { PetAvatar } from '@/components/pets/pet-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PetSex } from '@/utils/pet-catalog';
import { PawPrintIcon, PencilIcon } from 'lucide-react';

type MarketingPetMakerBasicsStepProps = {
  displayAvatarUrl: string | null;
  petName: string;
  sex: PetSex | '';
  avatarEnabled: boolean;
  croppingAvatar: boolean;
  onUpdateAvatar: () => void;
  onPetNameChange: (value: string) => void;
  onSexChange: (value: PetSex) => void;
};

export function MarketingPetMakerBasicsStep({
  displayAvatarUrl,
  petName,
  sex,
  avatarEnabled,
  croppingAvatar,
  onUpdateAvatar,
  onPetNameChange,
  onSexChange,
}: MarketingPetMakerBasicsStepProps) {
  const t = useTranslations('MarketingPetMaker');

  return (
    <section className={cn(dashboardCardClass, 'p-5 sm:p-6')}>
      <DashboardCardHeader
        icon={<PawPrintIcon className="size-[18px]" />}
        accent="bg-[#fff2c8]"
        title={t('basics.title')}
        description={t('basics.description')}
      />
      <div className="grid gap-5">
        <div className="flex max-w-sm items-center gap-3">
          <PetAvatar src={displayAvatarUrl} size="lg" />
          {avatarEnabled ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={croppingAvatar}
              onClick={onUpdateAvatar}
            >
              <PencilIcon className="size-3.5" />
              {t('profile.updateAvatar')}
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="basics-pet-name">{t('profile.nameLabel')}</Label>
            <Input
              id="basics-pet-name"
              value={petName}
              onChange={(event) => onPetNameChange(event.target.value)}
              placeholder={t('profile.namePlaceholder')}
              className="!h-11 w-full"
            />
          </div>
          <div className="grid w-full max-w-sm gap-2">
            <Label htmlFor="basics-sex">{t('profile.sexLabel')}</Label>
            <Select
              value={sex}
              onValueChange={(value) => onSexChange(value as PetSex)}
            >
              <SelectTrigger id="basics-sex" className="!h-11 w-full">
                <SelectValue placeholder={t('profile.sexPlaceholder')} />
              </SelectTrigger>
              <SelectContent
                translate="no"
                data-google-translate="no"
                className="notranslate"
              >
                <SelectItem value={PetSex.Male}>{t('sex.male')}</SelectItem>
                <SelectItem value={PetSex.Female}>{t('sex.female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
