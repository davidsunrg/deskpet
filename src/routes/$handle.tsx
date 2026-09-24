import { PublicPetProfilePage } from '@/components/public-pet-profile/public-pet-profile-page';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { getCatalogPetByBreed } from '@/pets/catalog';
import { getPublicPetProfile } from '@/pets/public-pet-profile';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/$handle')({
  loader: async ({ params }) => {
    const profile = params.handle.startsWith('@')
      ? getPublicPetProfile(params.handle.slice(1))
      : null;
    if (!profile) throw notFound();

    const playPet = await getCatalogPetByBreed('golden-retriever');
    return { profile, playPet };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { profile } = loaderData;
    const siteName = websiteConfig.metadata?.name ?? 'DeskPet.ai';

    return seo(`/@${profile.handle}`, {
      title: `${profile.name} | ${siteName}`,
      description: `Meet ${profile.name}, a ${profile.age} ${profile.breed}, and explore this DeskPet companion page.`,
    });
  },
  component: PublicPetProfileRoute,
});

function PublicPetProfileRoute() {
  const { profile, playPet } = Route.useLoaderData();
  return <PublicPetProfilePage profile={profile} playPet={playPet} />;
}
