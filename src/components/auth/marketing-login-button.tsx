'use client';

import { authClient } from '@/auth/client';
import { isRealSignedInUser } from '@/lib/auth/session-identity';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { m } from '@/locale/paraglide/messages';

interface MarketingLoginButtonProps {
  className?: string;
  callbackUrl?: string;
  /** SSR hint from root loader; used until client session resolves. */
  initialIsSignedIn?: boolean;
}

export function MarketingLoginButton({
  className,
  callbackUrl,
  initialIsSignedIn = false,
}: MarketingLoginButtonProps) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = isRealSignedInUser(session?.user);
  const showDashboard = isPending ? initialIsSignedIn : isSignedIn;
  const loginLabel = m.auth_common_login();
  const dashboardLabel = m.dashboard_title();

  const loginButtonClass = cn(
    buttonVariants({
      variant: 'outline',
      size: 'sm',
    }),
    // Match hero Cat/Dog badges: mono + black weight
    'cursor-pointer font-mono font-black',
    className
  );

  if (showDashboard) {
    return (
      <LocaleLink href={Routes.Dashboard} className={loginButtonClass}>
        {dashboardLabel}
      </LocaleLink>
    );
  }

  const loginHref = callbackUrl
    ? `${Routes.Login}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : Routes.Login;

  return (
    <LocaleLink href={loginHref} className={loginButtonClass}>
      {loginLabel}
    </LocaleLink>
  );
}
