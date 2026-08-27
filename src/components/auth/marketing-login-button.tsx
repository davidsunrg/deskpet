import { m } from '@/locale/paraglide/messages';
import { LoginWrapper } from '@/components/auth/login-wrapper';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarketingLoginButtonProps {
  className?: string;
  callbackUrl?: string;
  variant?: 'outline' | 'default';
}

export function MarketingLoginButton({
  className,
  callbackUrl,
  variant = 'outline',
}: MarketingLoginButtonProps) {
  return (
    <LoginWrapper mode="modal" asChild callbackUrl={callbackUrl}>
      <button
        type="button"
        className={cn(
          buttonVariants({ variant, size: 'sm' }),
          'cursor-pointer',
          className
        )}
      >
        {m.auth_common_login()}
      </button>
    </LoginWrapper>
  );
}
