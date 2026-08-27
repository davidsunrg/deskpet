import {
  adoptPetFn,
  createPetFn,
  listUserPetsForCurrentUser,
  setActivePetFn,
  updatePetProfileFn,
} from '@/api/pets';

type ActionResult<T> = {
  data?: T;
  serverError?: unknown;
};

async function wrapAction<T>(
  run: () => Promise<T>
): Promise<ActionResult<{ success: true } & T>> {
  try {
    const data = await run();
    return { data: { success: true as const, ...data } };
  } catch (error) {
    return {
      data: {
        success: false as const,
        error: error instanceof Error ? error.message : 'Request failed',
      },
    };
  }
}

export async function listPetsAction() {
  try {
    const data = await listUserPetsForCurrentUser();
    return { data: { success: true as const, data } };
  } catch (error) {
    return { serverError: error };
  }
}

export async function adoptPetAction(input: Parameters<typeof adoptPetFn>[0]) {
  return wrapAction(() => adoptPetFn({ data: input }));
}

export async function createPetAction(
  input: Parameters<typeof createPetFn>[0]
) {
  return wrapAction(() => createPetFn({ data: input }));
}

export async function updatePetProfileAction(
  input: Parameters<typeof updatePetProfileFn>[0]
) {
  return wrapAction(() => updatePetProfileFn({ data: input }));
}

export async function setActivePetAction(
  input: Parameters<typeof setActivePetFn>[0]
) {
  return wrapAction(() => setActivePetFn({ data: input }));
}
