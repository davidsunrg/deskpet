import { PetProfileDialog } from '@/components/pets/pet-profile-dialog';
import { Button, type buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ensureAnonymousSession } from '@/lib/auth/ensure-anonymous-session';
import { cn } from '@/lib/utils';
import {
  PetSpecies,
  parsePetBreed,
  parsePetSpecies,
} from '@/utils/pet-catalog';
import { getPresetPet } from '@/utils/preset-pets';
import type { VariantProps } from 'class-variance-authority';
import { PawPrintIcon } from 'lucide-react';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type AdoptPetButtonProps = {
  /** Code preset key (usually the breed key). */
  presetKey: string;
  /** Prefills the modal name field (defaults to localized breed label when provided). */
  defaultName?: string;
  /** Optional overrides when parent already has showcase data. */
  defaultSpecies?: string;
  defaultBreed?: string;
  className?: string;
  size?: ButtonVariantProps['size'];
  variant?: ButtonVariantProps['variant'];
  /** Show the paw icon on the trigger (default true). */
  showIcon?: boolean;
  label?: string;
  tooltip?: string;
};

/**
 * Opens the shared pet profile modal to adopt a code preset.
 * Ensures an anonymous guest session so adopt can proceed without login.
 */
export function AdoptPetButton({
  presetKey,
  defaultName = '',
  defaultSpecies,
  defaultBreed,
  className,
  size = 'xl',
  variant = 'brutal',
  showIcon = true,
  label,
  tooltip,
}: AdoptPetButtonProps) {
  const t = useTranslations('PetsPage.adopt');
  const [open, setOpen] = useState(false);

  const defaults = useMemo(() => {
    const preset = getPresetPet(presetKey);
    const species = parsePetSpecies(
      defaultSpecies ?? preset?.species ?? PetSpecies.Cat
    );
    const breed =
      parsePetBreed(defaultBreed ?? preset?.breed ?? '') ??
      parsePetBreed(presetKey) ??
      preset?.breed;
    return {
      name: defaultName || preset?.breed || '',
      species,
      breed: breed ?? '',
      avatar: preset?.avatar ?? null,
    };
  }, [presetKey, defaultName, defaultSpecies, defaultBreed]);

  const openDialog = () => {
    void ensureAnonymousSession().then((result) => {
      if (!result.ok) {
        toast.error(result.error);
      }
    });
    setOpen(true);
  };

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('w-full', className)}
      onClick={openDialog}
    >
      {showIcon ? <PawPrintIcon className="size-4" /> : null}
      {label ?? t('button')}
    </Button>
  );

  return (
    <>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      <PetProfileDialog
        mode="adopt"
        open={open}
        onOpenChange={setOpen}
        presetKey={presetKey}
        defaults={defaults}
      />
    </>
  );
}
