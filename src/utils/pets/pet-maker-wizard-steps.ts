export const WIZARD_STEPS = ['photos', 'basics', 'details'] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export type WizardStepUnlockState = {
  hasReferenceSources: boolean;
  isBasicsComplete: boolean;
};

export function isWizardStep(value: unknown): value is WizardStep {
  return (
    typeof value === 'string' &&
    (WIZARD_STEPS as readonly string[]).includes(value)
  );
}

export function stepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step);
}

export function isWizardStepUnlocked(
  target: WizardStep,
  unlock: WizardStepUnlockState
): boolean {
  switch (target) {
    case 'photos':
      return true;
    case 'basics':
      return unlock.hasReferenceSources;
    case 'details':
      return unlock.hasReferenceSources && unlock.isBasicsComplete;
    default:
      return false;
  }
}

/** Highest step the user may open from restored draft content alone. */
export function resolveHighestUnlockedStep(
  unlock: WizardStepUnlockState
): WizardStep {
  if (unlock.hasReferenceSources && unlock.isBasicsComplete) {
    return 'details';
  }
  if (unlock.hasReferenceSources) {
    return 'basics';
  }
  return 'photos';
}

export function clampStepToUnlocked(
  step: WizardStep | undefined,
  unlock: WizardStepUnlockState
): WizardStep {
  const candidate = step && isWizardStep(step) ? step : undefined;
  if (candidate && isWizardStepUnlocked(candidate, unlock)) {
    return candidate;
  }
  if (candidate === 'details' && isWizardStepUnlocked('basics', unlock)) {
    return 'basics';
  }
  return resolveHighestUnlockedStep(unlock);
}
