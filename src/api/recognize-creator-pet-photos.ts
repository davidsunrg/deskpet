import { createServerFn } from '@tanstack/react-start';
import { sessionApiMiddleware } from '@/middlewares/session-api-middleware';
import { z } from 'zod';

const recognizeCreatorPetPhotosSchema = z.object({
  petId: z.string().min(1),
  mediaIds: z.array(z.string().min(1)).min(1).max(8).optional(),
});

export const recognizeCreatorPetPhotosFn = createServerFn({ method: 'POST' })
  .validator(recognizeCreatorPetPhotosSchema)
  .middleware([sessionApiMiddleware])
  .handler(async () => {
    return {
      success: false as const,
      error: 'Pet photo recognition is not configured yet.',
    };
  });
