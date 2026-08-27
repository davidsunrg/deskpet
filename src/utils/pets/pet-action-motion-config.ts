/**
 * Per-action box/window motion metadata stored on `pet_action.metadata`
 * and in pet-skin `manifest.json` actions.
 */

import type { WalkScreenDirection } from '@/utils/pets/pet-walk-motion';
import { walkDirectionFromClipKey } from '@/utils/pets/pet-walk-motion';

export type PetActionBoxMotion = {
  enabled: boolean;
  direction: WalkScreenDirection;
  /** Clip time (seconds) when box translation may begin. Defaults to 0. */
  startAtSec?: number;
  /** Clip time (seconds) when box translation stops. Omit to move until end. */
  endAtSec?: number;
  speedWidthsPerSec?: number;
  minSpeedPxPerSec?: number;
};

export type PetActionMotionConfig = {
  boxMotion?: PetActionBoxMotion;
};

export type ResolvedBoxMotion = {
  direction: WalkScreenDirection;
  startAtSec: number;
  endAtSec: number | null;
  speedWidthsPerSec?: number;
  minSpeedPxPerSec?: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseOptionalNonNegativeSec(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (!isFiniteNumber(value) || value < 0) return undefined;
  return value;
}

function parseOptionalPositiveSpeed(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (!isFiniteNumber(value) || value <= 0) return undefined;
  return value;
}

/**
 * Validate unknown JSON into a typed motion config.
 * Returns null when the payload is missing or structurally invalid.
 */
export function parsePetActionMotionConfig(
  raw: unknown
): PetActionMotionConfig | null {
  if (raw == null) return null;
  if (typeof raw !== 'object' || Array.isArray(raw)) return null;

  const obj = raw as Record<string, unknown>;
  if (!('boxMotion' in obj) || obj.boxMotion == null) {
    // Empty `{}` is a valid empty config.
    return {};
  }

  const boxRaw = obj.boxMotion;
  if (typeof boxRaw !== 'object' || boxRaw == null || Array.isArray(boxRaw)) {
    return null;
  }

  const box = boxRaw as Record<string, unknown>;
  if (typeof box.enabled !== 'boolean') return null;
  if (box.direction !== 'left' && box.direction !== 'right') return null;

  const startAtSec = parseOptionalNonNegativeSec(box.startAtSec);
  const endAtSec = parseOptionalNonNegativeSec(box.endAtSec);
  if (startAtSec != null && endAtSec != null && endAtSec < startAtSec) {
    return null;
  }

  const speedWidthsPerSec = parseOptionalPositiveSpeed(box.speedWidthsPerSec);
  const minSpeedPxPerSec = parseOptionalPositiveSpeed(box.minSpeedPxPerSec);

  // Reject unknown numeric garbage that failed optional parsers when present.
  if (box.startAtSec != null && startAtSec == null) return null;
  if (box.endAtSec != null && endAtSec == null) return null;
  if (box.speedWidthsPerSec != null && speedWidthsPerSec == null) return null;
  if (box.minSpeedPxPerSec != null && minSpeedPxPerSec == null) return null;

  const boxMotion: PetActionBoxMotion = {
    enabled: box.enabled,
    direction: box.direction,
    ...(startAtSec != null ? { startAtSec } : {}),
    ...(endAtSec != null ? { endAtSec } : {}),
    ...(speedWidthsPerSec != null ? { speedWidthsPerSec } : {}),
    ...(minSpeedPxPerSec != null ? { minSpeedPxPerSec } : {}),
  };

  return { boxMotion };
}

/**
 * Resolve active box motion for a clip at `currentTimeSec`.
 * Explicit JSON wins; otherwise fall back to walk_*_loop key heuristics.
 */
export function resolveBoxMotion(input: {
  actionKey: string;
  motionConfig?: PetActionMotionConfig | null;
  currentTimeSec: number;
}): ResolvedBoxMotion | null {
  const configured = input.motionConfig?.boxMotion;
  if (configured) {
    if (!configured.enabled) return null;
    const startAtSec = configured.startAtSec ?? 0;
    const endAtSec = configured.endAtSec ?? null;
    const time = Number.isFinite(input.currentTimeSec)
      ? input.currentTimeSec
      : 0;
    if (time < startAtSec) return null;
    if (endAtSec != null && time >= endAtSec) return null;
    return {
      direction: configured.direction,
      startAtSec,
      endAtSec,
      ...(configured.speedWidthsPerSec != null
        ? { speedWidthsPerSec: configured.speedWidthsPerSec }
        : {}),
      ...(configured.minSpeedPxPerSec != null
        ? { minSpeedPxPerSec: configured.minSpeedPxPerSec }
        : {}),
    };
  }

  const fallback = walkDirectionFromClipKey(input.actionKey);
  if (!fallback) return null;
  return {
    direction: fallback,
    startAtSec: 0,
    endAtSec: null,
  };
}

/**
 * True when this action may translate the pet box at some point during playback
 * (ignores startAtSec / endAtSec time gates).
 */
export function actionCanMoveBox(input: {
  actionKey: string;
  motionConfig?: PetActionMotionConfig | null;
}): boolean {
  const configured = input.motionConfig?.boxMotion;
  if (configured) {
    return configured.enabled;
  }
  return walkDirectionFromClipKey(input.actionKey) != null;
}

/**
 * Box motion must not sample `currentTime` from a still-visible previous clip.
 * The playground double-buffer keeps the old video on screen until the next
 * clip paints — without this gate, sit/lick/scratch time can unlock
 * `sit_to_walk_*` motion immediately and slide the pet while the old pose shows.
 */
export function isBoxMotionVideoSynced(input: {
  mediaUrl?: string | null;
  videoSrc?: string | null;
}): boolean {
  const mediaUrl = input.mediaUrl?.trim() ?? '';
  if (!mediaUrl) {
    return true;
  }
  const videoSrc = input.videoSrc?.trim() ?? '';
  if (!videoSrc) {
    return false;
  }
  return videoSrc === mediaUrl;
}
