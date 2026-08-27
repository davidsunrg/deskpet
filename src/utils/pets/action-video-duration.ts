export const ACTION_VIDEO_DURATION_OPTIONS = [4, 5, 6, 7, 8, 9, 10] as const;

export type ActionVideoDurationSec =
  (typeof ACTION_VIDEO_DURATION_OPTIONS)[number];

export const DEFAULT_ACTION_VIDEO_DURATION_SEC: ActionVideoDurationSec = 4;

export const ACTION_VIDEO_DURATION_STORAGE_KEY =
  'petnet.dashboard.actions.videoDuration';

const ACTION_VIDEO_DURATION_SET = new Set<number>(
  ACTION_VIDEO_DURATION_OPTIONS
);

export function isActionVideoDurationSec(
  value: number
): value is ActionVideoDurationSec {
  return Number.isInteger(value) && ACTION_VIDEO_DURATION_SET.has(value);
}

export function parseActionVideoDurationSec(
  value: string | number | null | undefined
): ActionVideoDurationSec {
  const parsed =
    typeof value === 'number' ? value : value ? Number(value) : NaN;
  return isActionVideoDurationSec(parsed)
    ? parsed
    : DEFAULT_ACTION_VIDEO_DURATION_SEC;
}
