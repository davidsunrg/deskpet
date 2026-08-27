import { m } from '@/locale/paraglide/messages';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { SignupForm } from '@/components/auth/signup-form';
import { authClient } from '@/auth/client';
import { guestRouteMiddleware } from '@/middlewares/guest-middleware';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { websiteConfig } from '@/config/website';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';

export const Route = createFileRoute('/auth/signup')({
  beforeLoad: async () => {
    if (!websiteConfig.auth?.enable) {
      throw redirect({ to: Routes.Root });
    }
    if (typeof window !== 'undefined') {
      const { data: session } = await authClient.getSession();
      if (session?.user && isRealSignedInUser(session.user)) {
        throw redirect({ to: DEFAULT_LOGIN_REDIRECT });
      }
    }
  },
  component: SignupPage,
  server: {
    middleware: [guestRouteMiddleware],
  },
  head: () => ({
    meta: [
      { title: m.auth_signup_title() },
      { name: 'description', content: m.auth_signup_description() },
    ],
  }),
});

function SignupPage() {
  return (
    <div className="flex flex-col gap-4">
      <SignupForm />
      <div className="text-balance text-center text-xs text-muted-foreground">
        {m.auth_common_by_clicking_continue()}
        <Link
          to={Routes.TermsOfService}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_terms_of_service()}
        </Link>
        {m.auth_common_and()}
        <Link
          to={Routes.PrivacyPolicy}
          className="underline underline-offset-4 hover:text-primary"
        >
          {m.auth_common_privacy_policy()}
        </Link>
      </div>
    </div>
  );
}
