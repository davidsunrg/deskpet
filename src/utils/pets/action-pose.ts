/** Defaults and validation for pet action pose strip generation. */

/** Active pose image model — must match a registered adapter in `src/lib/models`. */
export const ACTION_POSE_MODEL_ID = 'bytedance/seedream-5.0-pro' as const;
/**
 * Horizontal three-slot sheet (legacy AI strip geometry):
 * three 1424×800 slots → 4272×800. Kept for recutting historical strips.
 */
export const ACTION_POSE_SLOT_WIDTH = 1424;
export const ACTION_POSE_SLOT_HEIGHT = 800;
export const ACTION_POSE_STRIP_WIDTH = ACTION_POSE_SLOT_WIDTH * 3;
export const ACTION_POSE_STRIP_HEIGHT = ACTION_POSE_SLOT_HEIGHT;
/** @deprecated Legacy AI strip size; new gens use {@link ACTION_POSE_SINGLE_SIZE}. */
export const ACTION_POSE_SIZE =
  `${ACTION_POSE_STRIP_WIDTH}x${ACTION_POSE_STRIP_HEIGHT}` as const;
export const ACTION_POSE_OUTPUT_FORMAT = 'png' as const;
/** Seedream 5.0 Pro supports up to 10 reference images. */
export const ACTION_POSE_MAX_SOURCE_PHOTOS = 10;
/** One Seedream slot reserved for the layout-only guide. */
export const ACTION_POSE_LAYOUT_GUIDE_REF_SLOTS = 1;
export const ACTION_POSE_MAX_IDENTITY_PHOTOS =
  ACTION_POSE_MAX_SOURCE_PHOTOS - ACTION_POSE_LAYOUT_GUIDE_REF_SLOTS;

/** Inset from each internal vertical divider when extracting a slot. */
export const ACTION_POSE_BOUNDARY_INSET_PX = 12;

/**
 * Stored pose frame size — matches video-gen 720p / 16:9
 * (`getPetVideoAiResolutionPixels('720p', '16:9')` → `1280x720`).
 */
export const ACTION_POSE_FRAME_WIDTH = 1280;
export const ACTION_POSE_FRAME_HEIGHT = 720;
export const ACTION_POSE_FRAME_ASPECT = '16:9' as const;
/** Stored green-bg pose frame MIME (strip + cutout are also PNG). */
export const ACTION_POSE_FRAME_MIME_TYPE = 'image/png' as const;

/**
 * Per-pose generation size (one model call → one 1280×720 green-screen image).
 */
export const ACTION_POSE_SINGLE_SIZE =
  `${ACTION_POSE_FRAME_WIDTH}x${ACTION_POSE_FRAME_HEIGHT}` as const;

/**
 * Server-composed history/preview strip: three 1280×720 slots → 3840×720.
 * Built from the three raw single-pose generations (not a single AI strip).
 */
export const ACTION_POSE_COMPOSED_SLOT_WIDTH = ACTION_POSE_FRAME_WIDTH;
export const ACTION_POSE_COMPOSED_SLOT_HEIGHT = ACTION_POSE_FRAME_HEIGHT;
export const ACTION_POSE_COMPOSED_STRIP_WIDTH =
  ACTION_POSE_COMPOSED_SLOT_WIDTH * 3;
export const ACTION_POSE_COMPOSED_STRIP_HEIGHT =
  ACTION_POSE_COMPOSED_SLOT_HEIGHT;
export const ACTION_POSE_COMPOSED_STRIP_SIZE =
  `${ACTION_POSE_COMPOSED_STRIP_WIDTH}x${ACTION_POSE_COMPOSED_STRIP_HEIGHT}` as const;

/** Storage / DB filename for a green-bg pose frame. */
export function actionPoseFrameFilename(poseType: string): string {
  return `action-pose-${poseType}.png`;
}

/** Dashboard download fallback when the CDN URL has no usable basename. */
export function actionPoseWithBgDownloadFilename(poseType: string): string {
  return `${poseType}.with-bg.png`;
}

export function actionPoseNoBgDownloadFilename(poseType: string): string {
  return `${poseType}.no-bg.png`;
}

/**
 * Canonical pose types for the dashboard Poses workspace.
 * `walk_right` is a horizontal mirror of `walk_left` (not AI-generated).
 */
export const ACTION_POSE_TYPES = [
  'front',
  'walk_left',
  'walk_right',
  'sleep_right',
] as const;
export type ActionPoseType = (typeof ACTION_POSE_TYPES)[number];

/**
 * Pose types that appear on the legacy/composed three-slot strip.
 * `walk_right` is derived separately and is not a strip cut.
 */
export const ACTION_POSE_STRIP_TYPES = [
  'front',
  'walk_left',
  'sleep_right',
] as const;
export type ActionPoseStripType = (typeof ACTION_POSE_STRIP_TYPES)[number];

/**
 * Legacy DB values from earlier naming.
 * `side` → walk_left, `sleep` → sleep_right when reading old rows.
 */
export const LEGACY_ACTION_POSE_TYPE_ALIASES = {
  side: 'walk_left',
  sleep: 'sleep_right',
} as const satisfies Record<string, ActionPoseType>;

export type LegacyActionPoseType = keyof typeof LEGACY_ACTION_POSE_TYPE_ALIASES;

/** Layout-guide / prompt labels. */
export const ACTION_POSE_STRIP_LABELS = {
  front: 'FRONT',
  walk_left: 'WALK LEFT',
  walk_right: 'WALK RIGHT',
  sleep_right: 'SLEEP RIGHT',
} as const satisfies Record<ActionPoseType, string>;

export type ActionPoseCropBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Nominal third-slots on the legacy 4272×800 AI sheet.
 * Left = front, middle = walk_left, right = sleep_right.
 */
export const ACTION_POSE_STRIP_CROPS = {
  front: {
    x: 0,
    y: 0,
    width: ACTION_POSE_SLOT_WIDTH,
    height: ACTION_POSE_SLOT_HEIGHT,
  },
  walk_left: {
    x: ACTION_POSE_SLOT_WIDTH,
    y: 0,
    width: ACTION_POSE_SLOT_WIDTH,
    height: ACTION_POSE_SLOT_HEIGHT,
  },
  sleep_right: {
    x: ACTION_POSE_SLOT_WIDTH * 2,
    y: 0,
    width: ACTION_POSE_SLOT_WIDTH,
    height: ACTION_POSE_SLOT_HEIGHT,
  },
} as const satisfies Record<ActionPoseStripType, ActionPoseCropBox>;

/**
 * Nominal slots on the composed 3840×720 one-by-one preview strip.
 */
export const ACTION_POSE_COMPOSED_STRIP_CROPS = {
  front: {
    x: 0,
    y: 0,
    width: ACTION_POSE_COMPOSED_SLOT_WIDTH,
    height: ACTION_POSE_COMPOSED_SLOT_HEIGHT,
  },
  walk_left: {
    x: ACTION_POSE_COMPOSED_SLOT_WIDTH,
    y: 0,
    width: ACTION_POSE_COMPOSED_SLOT_WIDTH,
    height: ACTION_POSE_COMPOSED_SLOT_HEIGHT,
  },
  sleep_right: {
    x: ACTION_POSE_COMPOSED_SLOT_WIDTH * 2,
    y: 0,
    width: ACTION_POSE_COMPOSED_SLOT_WIDTH,
    height: ACTION_POSE_COMPOSED_SLOT_HEIGHT,
  },
} as const satisfies Record<ActionPoseStripType, ActionPoseCropBox>;

export type ActionPoseStripLayoutKind = 'legacy_ai' | 'composed_preview';

export type ActionPoseStripLayout = {
  kind: ActionPoseStripLayoutKind;
  stripWidth: number;
  stripHeight: number;
  slotWidth: number;
  slotHeight: number;
  crops: Record<ActionPoseStripType, ActionPoseCropBox>;
};

function legacyActionPoseStripLayout(): ActionPoseStripLayout {
  return {
    kind: 'legacy_ai',
    stripWidth: ACTION_POSE_STRIP_WIDTH,
    stripHeight: ACTION_POSE_STRIP_HEIGHT,
    slotWidth: ACTION_POSE_SLOT_WIDTH,
    slotHeight: ACTION_POSE_SLOT_HEIGHT,
    crops: ACTION_POSE_STRIP_CROPS,
  };
}

function composedActionPoseStripLayout(): ActionPoseStripLayout {
  return {
    kind: 'composed_preview',
    stripWidth: ACTION_POSE_COMPOSED_STRIP_WIDTH,
    stripHeight: ACTION_POSE_COMPOSED_STRIP_HEIGHT,
    slotWidth: ACTION_POSE_COMPOSED_SLOT_WIDTH,
    slotHeight: ACTION_POSE_COMPOSED_SLOT_HEIGHT,
    crops: ACTION_POSE_COMPOSED_STRIP_CROPS,
  };
}

/**
 * Resolve strip crop geometry from stored/source image dimensions.
 * Defaults to legacy 4272×800 when size is unknown.
 */
export function resolveActionPoseStripLayout(
  width?: number | null,
  height?: number | null
): ActionPoseStripLayout {
  if (
    width === ACTION_POSE_COMPOSED_STRIP_WIDTH &&
    height === ACTION_POSE_COMPOSED_STRIP_HEIGHT
  ) {
    return composedActionPoseStripLayout();
  }
  if (
    width === ACTION_POSE_STRIP_WIDTH &&
    height === ACTION_POSE_STRIP_HEIGHT
  ) {
    return legacyActionPoseStripLayout();
  }
  if (width == null || height == null || width <= 0 || height <= 0) {
    return legacyActionPoseStripLayout();
  }
  const distComposed =
    Math.abs(width - ACTION_POSE_COMPOSED_STRIP_WIDTH) +
    Math.abs(height - ACTION_POSE_COMPOSED_STRIP_HEIGHT);
  const distLegacy =
    Math.abs(width - ACTION_POSE_STRIP_WIDTH) +
    Math.abs(height - ACTION_POSE_STRIP_HEIGHT);
  return distComposed <= distLegacy
    ? composedActionPoseStripLayout()
    : legacyActionPoseStripLayout();
}

/**
 * Shrink each nominal slot away from internal vertical divider(s).
 * Outer sheet edges stay flush. Used for legacy AI strips only.
 */
export function effectiveActionPoseStripCrop(
  poseType: ActionPoseStripType,
  insetPx = ACTION_POSE_BOUNDARY_INSET_PX
): ActionPoseCropBox {
  const nominal = ACTION_POSE_STRIP_CROPS[poseType];
  if (poseType === 'front') {
    return {
      x: nominal.x,
      y: nominal.y,
      width: nominal.width - insetPx,
      height: nominal.height,
    };
  }
  if (poseType === 'sleep_right') {
    return {
      x: nominal.x + insetPx,
      y: nominal.y,
      width: nominal.width - insetPx,
      height: nominal.height,
    };
  }
  // Middle slot: inset from both internal dividers.
  return {
    x: nominal.x + insetPx,
    y: nominal.y,
    width: nominal.width - insetPx * 2,
    height: nominal.height,
  };
}

/**
 * Crop box for a pose on the given strip layout.
 * Composed preview slots use exact 1280×720 boxes (no divider inset).
 */
export function effectiveActionPoseStripCropForLayout(
  layout: ActionPoseStripLayout,
  poseType: ActionPoseStripType,
  insetPx = ACTION_POSE_BOUNDARY_INSET_PX
): ActionPoseCropBox {
  if (layout.kind === 'composed_preview') {
    return layout.crops[poseType];
  }
  return effectiveActionPoseStripCrop(poseType, insetPx);
}

export function isActionPoseStripType(
  value: string
): value is ActionPoseStripType {
  return (ACTION_POSE_STRIP_TYPES as readonly string[]).includes(value);
}

export const ACTION_POSE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type ActionPoseImageMimeType =
  (typeof ACTION_POSE_IMAGE_MIME_TYPES)[number];

/** Browser-compressed AI reference: max long edge before upload. */
export const ACTION_POSE_REFERENCE_MAX_EDGE = 1536;
/** WebP quality (0–100) for compressed action references. */
export const ACTION_POSE_REFERENCE_QUALITY = 85;
export const ACTION_POSE_REFERENCE_MIME_TYPE = 'image/webp' as const;

const POSE_TYPE_SET = new Set<string>(ACTION_POSE_TYPES);
const MIME_SET = new Set<string>(ACTION_POSE_IMAGE_MIME_TYPES);

/**
 * Map a stored pose_type (canonical or legacy) to the canonical type.
 * Returns null for unknown values.
 */
export function canonicalizeActionPoseType(
  value: string
): ActionPoseType | null {
  if (POSE_TYPE_SET.has(value)) {
    return value as ActionPoseType;
  }
  const aliased =
    LEGACY_ACTION_POSE_TYPE_ALIASES[value as LegacyActionPoseType];
  return aliased ?? null;
}

/**
 * Stored pose_type values that count as `canonical` for lookup / deactivate.
 * Includes the canonical name plus any legacy aliases that map to it.
 */
export function storedPoseTypesForCanonical(
  poseType: ActionPoseType
): string[] {
  const aliases = (
    Object.entries(LEGACY_ACTION_POSE_TYPE_ALIASES) as Array<
      [LegacyActionPoseType, ActionPoseType]
    >
  )
    .filter(([, canonical]) => canonical === poseType)
    .map(([legacy]) => legacy);
  return [poseType, ...aliases];
}

/** Pose types to deactivate when regenerating the three-slot strip. */
export function poseTypesToDeactivateOnRegenerate(): string[] {
  return [
    ...ACTION_POSE_STRIP_TYPES,
    ...(Object.keys(LEGACY_ACTION_POSE_TYPE_ALIASES) as LegacyActionPoseType[]),
  ];
}

/**
 * Scale down so the long edge is at most `maxEdge`; never upscale.
 */
export function computeActionReferenceDimensions(
  width: number,
  height: number,
  maxEdge = ACTION_POSE_REFERENCE_MAX_EDGE
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  const scale = longEdge > maxEdge ? maxEdge / longEdge : 1;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function isActionPoseType(value: string): value is ActionPoseType {
  return POSE_TYPE_SET.has(value);
}

/** True for canonical types or known legacy aliases. */
export function isStoredActionPoseType(value: string): boolean {
  return canonicalizeActionPoseType(value) != null;
}

export function isActionPoseImageMimeType(
  value: string
): value is ActionPoseImageMimeType {
  return MIME_SET.has(value);
}

export const ACTION_POSE_ACCEPT = ACTION_POSE_IMAGE_MIME_TYPES.join(',');

/** Map size string into AI SDK `${number}x${number}` when valid. */
export function parseActionPoseSize(
  size: string
): `${number}x${number}` | undefined {
  const match = /^(\d+)x(\d+)$/.exec(size);
  if (!match) return undefined;
  return `${Number(match[1])}x${Number(match[2])}` as `${number}x${number}`;
}

/**
 * Validate uploaded source count for pose generation.
 * Returns an error message or null when valid.
 */
export function validatePoseSources(sourceCount: number): string | null {
  if (sourceCount <= 0) {
    return 'Upload at least one source photo.';
  }
  if (sourceCount > ACTION_POSE_MAX_IDENTITY_PHOTOS) {
    return `Use at most ${ACTION_POSE_MAX_IDENTITY_PHOTOS} source photos (one slot is reserved for the layout guide).`;
  }
  return null;
}

/** @deprecated Use {@link validatePoseSources}. */
export const validatePoseStripSources = validatePoseSources;
