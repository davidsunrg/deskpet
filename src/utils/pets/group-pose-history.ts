/**
 * Group pet action pose rows into per-type history for the Poses workspace.
 */
import {
  ACTION_POSE_TYPES,
  canonicalizeActionPoseType,
  type ActionPoseType,
} from '@/utils/pets/action-pose';

/** Minimal pose fields needed for per-type history (client list shape). */
export type PoseHistoryRow = {
  id: string;
  poseType: string;
  sourceImgFileId: string | null;
  sourceImgUrl: string | null;
  sourceImgWidth: number | null;
  sourceImgHeight: number | null;
  sourceImgByteSize: number | null;
  url: string;
  cutoutUrl: string | null;
  cutoutFileId?: string | null;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  model: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
};

export type PoseHistoryForType = {
  poseType: ActionPoseType;
  active: PoseHistoryRow | null;
  /** Newest first; includes the active row when present. */
  history: PoseHistoryRow[];
};

export type PoseHistoryByType = Record<ActionPoseType, PoseHistoryForType>;

function createdAtMs(value: string): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

function emptyBucket(poseType: ActionPoseType): PoseHistoryForType {
  return { poseType, active: null, history: [] };
}

/**
 * Group pose rows by canonical pose type (legacy `side` / `sleep` remapped).
 * History is newest-first; `active` is the active row when present.
 */
export function groupPoseHistoryByType(
  poses: readonly PoseHistoryRow[]
): PoseHistoryByType {
  const buckets = Object.fromEntries(
    ACTION_POSE_TYPES.map((poseType) => [poseType, emptyBucket(poseType)])
  ) as PoseHistoryByType;

  for (const pose of poses) {
    const canonical = canonicalizeActionPoseType(pose.poseType);
    if (!canonical) continue;
    buckets[canonical].history.push(pose);
  }

  for (const poseType of ACTION_POSE_TYPES) {
    const bucket = buckets[poseType];
    bucket.history.sort(
      (a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt)
    );
    bucket.active = bucket.history.find((row) => row.isActive) ?? null;
  }

  return buckets;
}

/**
 * Default history selection for a pose type: active row if present, else newest.
 */
export function defaultSelectedPoseId(
  items: readonly PoseHistoryRow[],
  activeId?: string | null
): string | null {
  if (activeId && items.some((item) => item.id === activeId)) {
    return activeId;
  }
  const active = items.find((item) => item.isActive);
  if (active) return active.id;
  return items[0]?.id ?? null;
}

/** Inactive history rows can be activated. */
export function canActivatePose(item: { isActive: boolean }): boolean {
  return !item.isActive;
}

/** Active rows cannot be deleted; activate another version first. */
export function canDeletePose(item: { isActive: boolean }): boolean {
  return !item.isActive;
}
