import { PlaygroundExperienceClient } from '@/components/playground/playground-experience-client';
import { listPlaygroundPresetPets } from '@/pets/catalog';
import { PLAYGROUND_PET_QUERY } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { websiteConfig } from '@/config/website';
import { createFileRoute } from '@tanstack/react-router';

function firstQueryValue(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0]) {
    return value[0];
  }
  return null;
}

export const Route = createFileRoute('/playground')({
  head: () =>
    seo('/playground', {
      title: `Pets Playground | ${websiteConfig.metadata?.name}`,
      description:
        'Interactive pets playground with look control, pet picker, and wallpaper presets.',
    }),
  loader: async ({ location }) => {
    const search = new URLSearchParams(location.search);
    const initialPetKey = firstQueryValue(search.get(PLAYGROUND_PET_QUERY));
    const presetPets = await listPlaygroundPresetPets();
    return { presetPets, initialPetKey };
  },
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const { presetPets, initialPetKey } = Route.useLoaderData();
  return (
    <PlaygroundExperienceClient
      presetPets={presetPets}
      initialPetKey={initialPetKey}
    />
  );
}
