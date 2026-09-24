'use client';

import { PlaygroundEmbed } from '@/components/playground/playground-embed';
import type { PlaygroundPet } from '@/utils/playground-pet';

type ProfilePlayCardProps = {
  name: string;
  playgroundPet: PlaygroundPet | null;
};

export function ProfilePlayCard({ name, playgroundPet }: ProfilePlayCardProps) {
  return (
    <div
      className="overflow-hidden rounded-[28px] border border-[#f0ded3] shadow-[0_14px_38px_rgba(100,62,47,0.08)]"
      data-testid="public-pet-profile-play-card"
    >
      <PlaygroundEmbed
        pets={playgroundPet ? [playgroundPet] : []}
        ariaLabel={`Play with ${name}`}
      />
    </div>
  );
}
