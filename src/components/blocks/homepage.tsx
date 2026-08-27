import HeroSection from '@/components/blocks/hero/hero';
import FeaturesSection from '@/components/blocks/features/features';
import BehaviorsSection from '@/components/blocks/behaviors/behaviors';
import ViralPetVideosSection from '@/components/blocks/viral-pet-videos/viral-pet-videos';
import FaqSection from '@/components/blocks/faqs/faqs';
import PricingSection from '@/components/blocks/pricing';
import { websiteConfig } from '@/config/website';
import type { PlaygroundPet } from '@/utils/playground-pet';
import type { ShowcasePet } from '@/utils/showcase-pets';

type HomePageProps = {
  catalogPets: ShowcasePet[];
  floatingPet: PlaygroundPet | null;
};

export function HomePage({ catalogPets, floatingPet }: HomePageProps) {
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
