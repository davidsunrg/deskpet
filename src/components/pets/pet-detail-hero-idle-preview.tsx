'use client';

import { PetVideoDoubleBuffer } from '@/components/pets/pet-video-double-buffer';
import { usePetActionAutoplay } from '@/components/pets/use-pet-action-autoplay';
import { useLookVideoScrub } from '@/components/pets/use-look-video-scrub';
import { PetActionClip } from '@/enums/pet-action-clip';
import { cn } from '@/lib/utils';
import {
  getShowcasePetAction,
  showcasePetScale,
  showcasePetWindowSize,
  type ShowcasePet,
} from '@/utils/showcase-pets';
import { useRef, useState, type PointerEvent } from 'react';

const DEFAULT_CLIP_ASPECT = 16 / 9;

type PetDetailHeroIdlePreviewProps = {
  pet: ShowcasePet;
  className?: string;
};

/**
 * Static sit-idle showcase for public `/p/{slug}` hero boxes: one clip,
 * no autoplay sequences, no walk/box motion, no floating overlay.
 */
export function PetDetailHeroIdlePreview({
  pet,
  className,
}: PetDetailHeroIdlePreviewProps) {
  const sitIdleAction = getShowcasePetAction(pet, PetActionClip.SitIdle);
  const actions = sitIdleAction ? [sitIdleAction] : [];

  const { actionKey, selectedAction, videoLoop, playbackNonce, onVideoEnded } =
    usePetActionAutoplay({
      actions,
      enabled: false,
    });

  const [mediaAspect, setMediaAspect] = useState<number | undefined>(undefined);
  const [mediaFailed, setMediaFailed] = useState(false);

  const supportsLookControl = selectedAction?.interaction === 'look-scrub';
  const videoUrl = selectedAction?.mediaUrl ?? '';
  const resetKey = `${pet.id}:${selectedAction?.key ?? 'none'}:${videoUrl}:${playbackNonce}`;

  const effectiveScale = showcasePetScale(pet, actionKey);
  const petSize = showcasePetWindowSize(
    effectiveScale,
    mediaAspect ?? DEFAULT_CLIP_ASPECT
  );

  const videoRef = useRef<HTMLVideoElement>(null);

  const markGeometryReady = (video: HTMLVideoElement) => {
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setMediaAspect(video.videoWidth / video.videoHeight);
    }
  };

  const { handlePointerX, endPointer } = useLookVideoScrub({
    videoRef,
    enabled: Boolean(supportsLookControl),
    resetKey,
    loop: videoLoop,
    onReady: markGeometryReady,
  });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!supportsLookControl) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    handlePointerX((event.clientX - rect.left) / rect.width, 'mouse');
  };

  if (!sitIdleAction || mediaFailed || !videoUrl) {
    return (
      <img
        src={pet.avatar}
        alt={`${pet.breedLabel} preview`}
        className={cn(
          'max-h-72 w-full max-w-sm rounded-md object-contain drop-shadow-[0_18px_0_rgba(55,39,51,0.08)] md:max-h-96',
          className
        )}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={cn(
        'relative mx-auto max-w-sm',
        supportsLookControl && 'cursor-pointer',
        className
      )}
      style={{
        width: Math.min(petSize.width, 384),
        height: Math.min(petSize.height, 384),
      }}
      data-testid="pet-detail-hero-idle-preview"
      data-pet-id={pet.id}
      data-pet-action={actionKey}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => endPointer('mouse')}
    >
      <PetVideoDoubleBuffer
        src={videoUrl}
        srcKey={resetKey}
        poster={pet.avatar}
        loop={videoLoop}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain drop-shadow-[0_18px_0_rgba(55,39,51,0.08)]"
        ariaLabel={`${pet.breedLabel} sit idle preview`}
        videoRef={videoRef}
        onReady={markGeometryReady}
        onEnded={onVideoEnded}
        onError={() => setMediaFailed(true)}
      />
    </div>
  );
}
