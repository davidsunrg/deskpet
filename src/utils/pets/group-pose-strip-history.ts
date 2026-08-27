/**
 * Group pet action pose rows into generated-strip history by shared raw strip.
 */
import {
  ACTION_POSE_STRIP_TYPES,
  canonicalizeActionPoseType,
  type ActionPoseType,
} from '@/utils/pets/action-pose';

/** Minimal pose fields needed to build strip history (client list shape). */
export type PoseStripHistoryRow = {
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

export type PoseStripHistoryItem = {
  sourceImgFileId: string;
  sourceImgUrl: string | null;
  sourceImgWidth: number | null;
  sourceImgHeight: number | null;
  sourceImgByteSize: number | null;
  /** Newest `createdAt` among cuts in this strip. */
  createdAt: string;
  model: string;
  prompt: string;
  /** True when any cut in the group is currently active. */
  isActive: boolean;
  posesByType: Partial<Record<ActionPoseType, PoseStripHistoryRow>>;
  cutCount: number;
  expectedCutCount: number;
};

function createdAtMs(value: string): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * Prefer the active cut for a type; otherwise keep the newest row.
 */
function preferCutRow(
  existing: PoseStripHistoryRow | undefined,
  next: PoseStripHistoryRow
): PoseStripHistoryRow {
  if (!existing) return next;
  if (next.isActive && !existing.isActive) return next;
  if (existing.isActive && !next.isActive) return existing;
  return createdAtMs(next.createdAt) >= createdAtMs(existing.createdAt)
    ? next
    : existing;
}

/**
 * Group pose rows by `sourceImgFileId`, newest strip first.
 * Rows without a source strip id are ignored. Legacy `side` / `sleep`
 * types are mapped via {@link canonicalizeActionPoseType}.
 */
export function groupPoseStripHistory(
  poses: readonly PoseStripHistoryRow[]
): PoseStripHistoryItem[] {
  const groups = new Map<
    string,
    {
      sourceImgFileId: string;
      sourceImgUrl: string | null;
      sourceImgWidth: number | null;
      sourceImgHeight: number | null;
      sourceImgByteSize: number | null;
      createdAt: string;
      model: string;
      prompt: string;
      isActive: boolean;
      posesByType: Partial<Record<ActionPoseType, PoseStripHistoryRow>>;
    }
  >();

  for (const pose of poses) {
    const sourceImgFileId = pose.sourceImgFileId?.trim();
    if (!sourceImgFileId) continue;

    const canonical = canonicalizeActionPoseType(pose.poseType);
    if (!canonical) continue;

    const existing = groups.get(sourceImgFileId);
    if (!existing) {
      groups.set(sourceImgFileId, {
        sourceImgFileId,
        sourceImgUrl: pose.sourceImgUrl,
        sourceImgWidth: pose.sourceImgWidth,
        sourceImgHeight: pose.sourceImgHeight,
        sourceImgByteSize: pose.sourceImgByteSize,
        createdAt: pose.createdAt,
        model: pose.model,
        prompt: pose.prompt,
        isActive: pose.isActive,
        posesByType: { [canonical]: pose },
      });
      continue;
    }

    existing.posesByType[canonical] = preferCutRow(
      existing.posesByType[canonical],
      pose
    );
    existing.isActive = existing.isActive || pose.isActive;
    if (createdAtMs(pose.createdAt) >= createdAtMs(existing.createdAt)) {
      existing.createdAt = pose.createdAt;
      existing.model = pose.model;
      existing.prompt = pose.prompt;
    }
    if (!existing.sourceImgUrl && pose.sourceImgUrl) {
      existing.sourceImgUrl = pose.sourceImgUrl;
    }
    if (existing.sourceImgWidth == null && pose.sourceImgWidth != null) {
      existing.sourceImgWidth = pose.sourceImgWidth;
    }
    if (existing.sourceImgHeight == null && pose.sourceImgHeight != null) {
      existing.sourceImgHeight = pose.sourceImgHeight;
    }
    if (existing.sourceImgByteSize == null && pose.sourceImgByteSize != null) {
      existing.sourceImgByteSize = pose.sourceImgByteSize;
    }
  }

  const expectedCutCount = ACTION_POSE_STRIP_TYPES.length;

  return [...groups.values()]
    .map((group) => {
      const cutCount = ACTION_POSE_STRIP_TYPES.filter(
        (poseType) => group.posesByType[poseType] != null
      ).length;
      return {
        ...group,
        cutCount,
        expectedCutCount,
      };
    })
    .sort((a, b) => createdAtMs(b.createdAt) - createdAtMs(a.createdAt));
}

/**
 * Default history selection: active strip if present, otherwise newest.
 */
export function defaultSelectedPoseStripFileId(
  items: readonly PoseStripHistoryItem[]
): string | null {
  const active = items.find((item) => item.isActive);
  if (active) return active.sourceImgFileId;
  return items[0]?.sourceImgFileId ?? null;
}
