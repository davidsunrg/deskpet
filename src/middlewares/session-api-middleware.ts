import { auth } from '@/auth/auth';
import { createMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

/**
 * Session API middleware: requires any authenticated session, including
 * anonymous guest sessions. Passes context: { userId } to handlers.
 */
export const sessionApiMiddleware = createMiddleware().server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return await next({ context: { userId: session.user.id } });
  }
);
