import HeroSection from '@/components/blocks/hero/hero';
import FeaturesSection from '@/components/blocks/features/features';
import BehaviorsSection from '@/components/blocks/behaviors/behaviors';
import ViralPetVideosSection from '@/components/blocks/viral-pet-videos/viral-pet-videos';
import FaqSection from '@/components/blocks/faqs/faqs';
import PricingSection from '@/components/blocks/pricing';
import { websiteConfig } from '@/config/website';
import { listHeroPets, listPlaygroundPresetPets } from '@/pets/catalog';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { createServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';

const getHomePageData = createServerFn({ method: 'GET' }).handler(async () => {
  const [homePlayablePets, catalogPets] = await Promise.all([
    listPlaygroundPresetPets({ visibleIn: 'home' }),
    listHeroPets(HERO_PET_PREVIEW_COUNT),
  ]);
  const floatingPet =
    homePlayablePets.find((pet) => pet.species === 'dog') ?? null;
  return { catalogPets, floatingPet };
});

export function HomePage() {
  const { data } = useQuery({
    queryKey: ['home-page-pets'],
    queryFn: () => getHomePageData(),
  });

  const catalogPets = data?.catalogPets ?? [];
  const floatingPet = data?.floatingPet ?? null;

  return (
    <div className="flex flex-col">
      <HeroSection pets={catalogPets} floatingPet={floatingPet} />

      <ViralPetVideosSection />

      <FeaturesSection />

      <BehaviorsSection />

      {websiteConfig.payment?.enable ? <PricingSection /> : <FaqSection />}
    </div>
  );
}
