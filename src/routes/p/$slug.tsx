import { PetDetailTemplate } from '@/components/templates/pet-detail-template';
import { websiteConfig } from '@/config/website';
import { getPublicPetMediaBase } from '@/lib/pet-media';
import { petDetailRoute, Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getCatalogPetByBreed, listRelatedCatalogPets } from '@/pets/catalog';
import { getCatalogPetDetailCopy } from '@/utils/catalog-pet-detail-copy';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';
import {
  getPetResourceByIdOrBreed,
  isPetResourceVisible,
  petResourceToShowcasePet,
} from '@/utils/pets/pet-resources';
import { showcasePetToDetail } from '@/utils/pets/showcase-pet-to-detail';
import { createFileRoute, notFound } from '@tanstack/react-router';

function resolveDetailResource(slug: string): PetResourceManifest | undefined {
  const decodedSlug = decodeURIComponent(slug);
  const resource = getPetResourceByIdOrBreed(decodedSlug);

  if (
    !resource ||
    resource.id !== decodedSlug ||
    !isPetResourceVisible(resource, 'detail')
  ) {
    return undefined;
  }

  return resource;
}

export const Route = createFileRoute('/p/$slug')({
  loader: async ({ params }) => {
    const resource = resolveDetailResource(params.slug);
    if (!resource) throw notFound();

    const playPresetKey = resource.detail?.playPresetKey ?? resource.id;
    const playPet = await getCatalogPetByBreed(playPresetKey);
    const relatedPets = await listRelatedCatalogPets(
      playPet?.id ?? resource.id,
      4
    );

    const identityPet =
      playPet?.id === resource.id
        ? playPet
        : petResourceToShowcasePet(resource, {
            publicStorageBase: getPublicPetMediaBase(),
            breedLabel: resource.name,
            ...(resource.detail?.description
              ? { description: resource.detail.description }
              : {}),
          });

    const baseDetail = showcasePetToDetail(identityPet);
    const pet = {
      ...baseDetail,
      name: resource.name,
      description: resource.detail?.description ?? baseDetail.description,
      catalogSource: resource.detail?.catalogSource ?? baseDetail.catalogSource,
    };

    return { resource, pet, playPet, relatedPets };
  },
  head: ({ loaderData }) => {
    const resource = loaderData?.resource;
    if (!resource) return {};

    const detailCopy =
      resource.detail?.copy ?? getCatalogPetDetailCopy(resource.breed);
    const siteName = websiteConfig.metadata?.name ?? 'DeskPet.ai';

    return seo(petDetailRoute(resource.id), {
      title: resource.detail?.title ?? `${resource.name} | ${siteName}`,
      description: detailCopy.metaDescription,
    });
  },
  component: PetDetailRoute,
});

function PetDetailRoute() {
  const { resource, pet, playPet, relatedPets } = Route.useLoaderData();
  const detailCopy =
    resource.detail?.copy ?? getCatalogPetDetailCopy(resource.breed);

  return (
    <main className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <PetDetailTemplate
          pet={pet}
          playPet={playPet}
          relatedPets={relatedPets}
          detailCopy={detailCopy}
          faqs={resource.detail?.faqs}
          backHref={Routes.Pets}
          backLabel="Pets"
          heroBadgeLabel={resource.detail?.heroBadgeLabel}
          availabilityText={resource.detail?.availabilityText}
        />
      </div>
    </main>
  );
}
