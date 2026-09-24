'use client';

import { PlaygroundEmbed } from '@/components/playground/playground-embed';
import type { PlaygroundPet } from '@/utils/playground-pet';

type ProfilePlayCardProps = {
  name: string;
  playgroundPet: PlaygroundPet | null;
};

export function ProfilePlayCard({ name, playgroundPet }: ProfilePlayCardProps) {
  return (
    <div data-testid="public-pet-profile-play-card">
      <PlaygroundEmbed
        pets={playgroundPet ? [playgroundPet] : []}
        ariaLabel={`Play with ${name}`}
      />
    </div>
  );
}
