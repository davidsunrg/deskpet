export const MARKETING_PET_MAKER_STEPS = [
  'photos',
  'basics',
  'details',
] as const;

export type MarketingPetMakerStep = (typeof MARKETING_PET_MAKER_STEPS)[number];

export type MarketingPetMakerUnlockState = {
  hasReferenceSources: boolean;
  isBasicsComplete: boolean;
  isDetailsComplete?: boolean;
};

export function isMarketingPetMakerStep(
  value: unknown
): value is MarketingPetMakerStep {
  return (
    typeof value === 'string' &&
    (MARKETING_PET_MAKER_STEPS as readonly string[]).includes(value)
  );
}

export function marketingPetMakerStepIndex(
  step: MarketingPetMakerStep
): number {
  return MARKETING_PET_MAKER_STEPS.indexOf(step);
}

export function isMarketingPetMakerStepUnlocked(
  target: MarketingPetMakerStep,
  unlock: MarketingPetMakerUnlockState
): boolean {
  switch (target) {
    case 'photos':
      return true;
    case 'basics':
      return unlock.hasReferenceSources;
    case 'details':
      return unlock.hasReferenceSources && unlock.isBasicsComplete;
  }
}

function resolveHighestUnlockedMarketingStep(
  unlock: MarketingPetMakerUnlockState
): MarketingPetMakerStep {
  if (unlock.hasReferenceSources && unlock.isBasicsComplete) return 'details';
  if (unlock.hasReferenceSources) return 'basics';
  return 'photos';
}

export function clampMarketingPetMakerStepToUnlocked(
  step: unknown,
  unlock: MarketingPetMakerUnlockState
): MarketingPetMakerStep {
  if (
    isMarketingPetMakerStep(step) &&
    isMarketingPetMakerStepUnlocked(step, unlock)
  ) {
    return step;
  }
  if (step === 'final' && isMarketingPetMakerStepUnlocked('details', unlock)) {
    return 'details';
  }
  if (step === 'details' && isMarketingPetMakerStepUnlocked('basics', unlock)) {
    return 'basics';
  }
  return resolveHighestUnlockedMarketingStep(unlock);
}
