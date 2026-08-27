import { actionConfig } from '@/config/action-config';
import { isPetActionClip } from '@/enums/pet-action-clip';
import {
  getPetResource,
  petResourceRegistry,
  type PetResourceAction,
  type PetResourceManifest,
} from '@/utils/pets/pet-resources';
import type { PlaygroundPetAction } from '@/utils/playground-pet';
import type { ShowcasePetAction } from '@/utils/showcase-pets';

export type ResolvePresetPetActionsInput = {
  presetKey: string;
  species: string;
  publicStorageBase: string | undefined;
};

function normalizePublicStorageBase(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

function normalizeR2Key(value: string): string {
  return value.trim().replace(/^\/+/, '');
}

export function validatePetResourceRegistry(
  registry: Readonly<Record<string, PetResourceManifest>> = petResourceRegistry,
  clips: Readonly<Record<string, unknown>> = actionConfig.clips
): string[] {
  const errors: string[] = [];

  for (const [resourceKey, resource] of Object.entries(registry)) {
    const context = `petResourceRegistry.${resourceKey}`;
    if (resource.id !== resourceKey) {
      errors.push(`${context}.id must match its registry key`);
    }
    if (!resource.name.trim()) {
      errors.push(`${context}.name must not be empty`);
    }
    const avatarR2Key = resource.avatarR2Key.trim();
    if (!avatarR2Key) {
      errors.push(`${context}.avatarR2Key must not be empty`);
    } else if (
      avatarR2Key.startsWith('/') ||
      /^[a-z][a-z\d+.-]*:\/\//i.test(avatarR2Key)
    ) {
      errors.push(`${context}.avatarR2Key must be a relative object key`);
    }

    const seenKeys = new Set<string>();
    for (const [index, action] of resource.actions.entries()) {
      const actionContext = `${context}.actions[${index}]`;
      if (!isPetActionClip(action.key) || !(action.key in clips)) {
        errors.push(
          `${actionContext}.key references unknown clip "${action.key}"`
        );
      }
      if (seenKeys.has(action.key)) {
        errors.push(`${actionContext}.key duplicates clip "${action.key}"`);
      }
      seenKeys.add(action.key);

      const r2Key = action.r2Key.trim();
      if (!r2Key) {
        errors.push(`${actionContext}.r2Key must not be empty`);
      } else if (
        r2Key.startsWith('/') ||
        /^[a-z][a-z\d+.-]*:\/\//i.test(r2Key)
      ) {
        errors.push(`${actionContext}.r2Key must be a relative object key`);
      }
    }
  }

  return errors;
}

function configuredPresetActions(
  input: ResolvePresetPetActionsInput
): readonly PetResourceAction[] {
  const errors = validatePetResourceRegistry();
  if (errors.length > 0) {
    throw new Error(`Invalid pet resource registry:\n${errors.join('\n')}`);
  }

  const resource = getPetResource(input.presetKey);
  if (!resource || resource.species !== input.species) {
    return [];
  }
  return resource.actions;
}

/** Resolve registry-backed preset clips into playground action DTOs. */
export function resolvePresetPetActions(
  input: ResolvePresetPetActionsInput
): PlaygroundPetAction[] {
  const actions = configuredPresetActions(input);
  if (actions.length === 0) return [];

  const publicStorageBase = normalizePublicStorageBase(input.publicStorageBase);
  if (!publicStorageBase) {
    throw new Error(
      'STORAGE_PUBLIC_URL is not configured for preset action media.'
    );
  }

  return actions.map((action) => ({
    key: action.key,
    mediaType: 'video',
    mediaUrl: `${publicStorageBase}/${normalizeR2Key(action.r2Key)}`,
    displayScale: action.displayScale,
    interaction: action.interaction,
    ...(action.motionConfig !== undefined
      ? { motionConfig: action.motionConfig }
      : {}),
  }));
}

/** Resolve registry-backed preset clips into marketing showcase action DTOs. */
export function resolvePresetShowcaseActions(
  input: ResolvePresetPetActionsInput
): ShowcasePetAction[] {
  return resolvePresetPetActions(input).map((action) => ({
    key: action.key,
    mediaUrl: action.mediaUrl,
    displayScale: action.displayScale,
    interaction: action.interaction,
  }));
}
