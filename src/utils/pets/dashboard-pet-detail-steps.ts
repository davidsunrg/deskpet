export const DASHBOARD_PET_DETAIL_STEPS = [
  'photos',
  'basics',
  'details',
  'final',
] as const;

export type DashboardPetDetailStep =
  (typeof DASHBOARD_PET_DETAIL_STEPS)[number];

export const DEFAULT_DASHBOARD_PET_DETAIL_STEP: DashboardPetDetailStep =
  'final';

export function isDashboardPetDetailStep(
  value: unknown
): value is DashboardPetDetailStep {
  return (
    typeof value === 'string' &&
    (DASHBOARD_PET_DETAIL_STEPS as readonly string[]).includes(value)
  );
}
