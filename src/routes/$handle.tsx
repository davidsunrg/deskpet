import { PublicPetProfilePage } from '@/components/public-pet-profile/public-pet-profile-page';
import { websiteConfig } from '@/config/website';
import { publicPetProfileRoute } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { getPublicPetProfile } from '@/pets/public-pet-profile';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/$handle')({
  loader: ({ params }) => {
    const profile = params.handle.startsWith('@')
      ? getPublicPetProfile(params.handle.slice(1))
      : null;
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const siteName = websiteConfig.metadata?.name ?? 'DeskPet';
    return seo(publicPetProfileRoute(loaderData.handle), {
      title: `${loaderData.name} | ${siteName}`,
      description: `Meet ${loaderData.name}, a ${loaderData.age} ${loaderData.breed}, and explore their favorite memories.`,
    });
  },
  component: PublicPetProfileRoute,
});

function PublicPetProfileRoute() {
  const profile = Route.useLoaderData();
  return <PublicPetProfilePage profile={profile} />;
}
