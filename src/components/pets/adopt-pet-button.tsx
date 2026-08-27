import { Button, type buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/deskpet-i18n';
import type { VariantProps } from 'class-variance-authority';
import { PawPrintIcon } from 'lucide-react';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

type AdoptPetButtonProps = {
  presetKey: string;
  defaultName?: string;
  defaultSpecies?: string;
  defaultBreed?: string;
  className?: string;
  size?: ButtonVariantProps['size'];
  variant?: ButtonVariantProps['variant'];
  showIcon?: boolean;
  label?: string;
  tooltip?: string;
};

/** Links to the desktop pet maker for preset-inspired customization. */
export function AdoptPetButton({
  className,
  size = 'xl',
  variant = 'brutal',
  showIcon = true,
  label,
  tooltip,
}: AdoptPetButtonProps) {
  const t = useTranslations('PetsPage.adopt');

  const button = (
    <Button
      variant={variant}
      size={size}
      className={cn('w-full', className)}
      asChild
    >
      <LocaleLink href={Routes.DesktopPetCreator}>
        {showIcon ? <PawPrintIcon className="size-4" /> : null}
        {label ?? t('button')}
      </LocaleLink>
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
