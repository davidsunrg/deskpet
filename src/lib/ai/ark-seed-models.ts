/**
 * Ark Seed / Doubao image-capable endpoints for creator pet recognition.
 */
export const ArkSeedModel = {
  Seed21Pro: 'ep-20260623135216-v59dp',
  Seed21Turbo: 'ep-20260623135258-frfq6',
  Seed20Pro: 'ep-20260317171237-xwhfz',
  Seed20Code: 'ep-20260618174316-gcgp2',
  Seed20Lite: 'ep-20260319105337-s5hn6',
  Seed20Mini: 'ep-20260318155601-jt2hb',
  Seed18: 'ep-20260512163054-7cr7m',
  Doubao16Vision: 'ep-20260512162529-gnnmk',
} as const;

export type ArkSeedModelId = (typeof ArkSeedModel)[keyof typeof ArkSeedModel];

export type ArkSeedModelDefinition = {
  id: ArkSeedModelId;
  key: keyof typeof ArkSeedModel;
  label: string;
  supportsImages: true;
};

export const ARK_SEED_MODELS = [
  {
    id: ArkSeedModel.Seed21Pro,
    key: 'Seed21Pro',
    label: 'Seed 2.1 Pro',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed21Turbo,
    key: 'Seed21Turbo',
    label: 'Seed 2.1 Turbo',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed20Pro,
    key: 'Seed20Pro',
    label: 'Seed 2.0 Pro',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed20Code,
    key: 'Seed20Code',
    label: 'Seed 2.0 Code',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed20Lite,
    key: 'Seed20Lite',
    label: 'Seed 2.0 Lite',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed20Mini,
    key: 'Seed20Mini',
    label: 'Seed 2.0 Mini',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Seed18,
    key: 'Seed18',
    label: 'Seed 1.8',
    supportsImages: true,
  },
  {
    id: ArkSeedModel.Doubao16Vision,
    key: 'Doubao16Vision',
    label: 'Doubao 1.6 Vision',
    supportsImages: true,
  },
] as const satisfies readonly ArkSeedModelDefinition[];

/** Default recognition model (matches reference creator probe). */
export const DEFAULT_ARK_SEED_MODEL_ID = ArkSeedModel.Seed20Mini;

const ARK_SEED_MODEL_ID_SET = new Set<string>(
  ARK_SEED_MODELS.map((model) => model.id)
);

export function isArkSeedModelId(value: string): value is ArkSeedModelId {
  return ARK_SEED_MODEL_ID_SET.has(value);
}

export function getArkSeedModel(
  id: string
): ArkSeedModelDefinition | undefined {
  return ARK_SEED_MODELS.find((model) => model.id === id);
}

/**
 * Resolve recognition model: explicit id → default Mini.
 */
export function resolveArkSeedModelId(
  preferred?: string | null
): ArkSeedModelId {
  const candidate = preferred?.trim();
  if (candidate && isArkSeedModelId(candidate)) {
    return candidate;
  }
  return DEFAULT_ARK_SEED_MODEL_ID;
}
