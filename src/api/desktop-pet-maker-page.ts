import { auth } from '@/auth/auth';
import { listHeroPets } from '@/pets/catalog';
import { loadCreatorWizardDraft } from '@/server/pets/load-creator-wizard-draft';
import { HERO_PET_PREVIEW_COUNT } from '@/utils/showcase-pets';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

export const loadDesktopPetMakerPageDataFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  const sessionUserId = session?.user?.id ?? null;
  const [heroPets, initialDraft] = await Promise.all([
    listHeroPets(HERO_PET_PREVIEW_COUNT),
    sessionUserId ? loadCreatorWizardDraft(sessionUserId) : null,
  ]);
  return { heroPets, initialDraft };
});
