import { cn } from '@/lib/utils';
import { PetSpecies } from '@/utils/pet-catalog';

type CustomPetHeroDogIconProps = {
  className?: string;
  species?: string | null;
};

/** Pet sketch with heart bubble — used on the Final pricing paywall hero. */
export function CustomPetHeroDogIcon({
  className,
  species,
}: CustomPetHeroDogIconProps) {
  const imageSrc =
    species === PetSpecies.Cat ? '/cat-sketch.webp' : '/dog-sketch.webp';

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public asset
    <img
      src={imageSrc}
      alt=""
      aria-hidden
      className={cn('object-contain', className)}
    />
  );
}
