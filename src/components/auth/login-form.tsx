import { getAuthErrorMessage, getAuthErrorMessages } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { AuthCard } from '@/components/auth/auth-card';
import {
  EmailOtpForm,
  type EmailOtpFormLabels,
} from '@/components/auth/email-otp-form';
import { FormError } from '@/components/shared/form-error';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { IconLoader2 } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { SocialLoginButton } from './social-login-button';

export interface LoginFormProps {
  className?: string;
  callbackUrl?: string;
  onSuccess?: () => void;
  onAuthenticated?: () => void;
  onSwitchToSignup?: () => void;
  bottomButtonHref?: string;
}

export function LoginForm({
  className,
  callbackUrl: propCallbackUrl,
  onSuccess,
  onAuthenticated,
  onSwitchToSignup,
  bottomButtonHref = Routes.Signup,
}: LoginFormProps) {
  const router = useRouter();
  const urlError =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('error')
      : null;
  const authErrorMessages = getAuthErrorMessages();
  const urlErrorMessage = urlError
    ? (authErrorMessages[urlError] ?? urlError)
    : undefined;
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null;
  const defaultCallbackUrl = getPathWithLocale(DEFAULT_LOGIN_REDIRECT);
  const callbackUrl =
    propCallbackUrl ??
    (paramCallbackUrl ? paramCallbackUrl : defaultCallbackUrl);
  const emailOtpLoginEnabled = websiteConfig.auth?.enableEmailOtpLogin ?? false;
  const googleLoginEnabled = websiteConfig.auth?.enableGoogleLogin ?? false;

  const [error, setError] = useState<string | undefined>();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const labels: EmailOtpFormLabels = {
    email: m.auth_login_email(),
    emailPlaceholder: m.auth_login_email_address_placeholder(),
    verificationCode: m.auth_otp_code(),
    codeSentHint: m.auth_otp_code_sent_hint(),
    continue: m.auth_otp_continue(),
    clearEmail: m.auth_otp_clear_email(),
    pleaseEnterCode: m.auth_otp_please_enter_code(),
    changeEmail: m.auth_otp_use_different_email(),
    resendCode: m.auth_otp_resend(),
  };

  const handleSendOtp = async (
    email: string,
    _options?: { isResend?: boolean }
  ) => {
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    });
    if (sendError) {
      const message = getAuthErrorMessage(sendError);
      setError(message);
      throw new Error(message);
    }
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    const result = await authClient.signIn.emailOtp({ email, otp });
    if (result.error) {
      const message = getAuthErrorMessage(result.error);
      setError(message);
      throw new Error(message);
    }
    await authClient.getSession({ query: { disableCookieCache: true } });
  };

  const handleSuccess = () => {
    const afterAuth = onAuthenticated ?? onSuccess;
    if (afterAuth) {
      afterAuth();
      return;
    }
    setIsRedirecting(true);
    router.navigate({ to: callbackUrl });
    void router.invalidate();
  };

  return (
    <>
      {isRedirecting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <IconLoader2 className="size-8 animate-spin" />
            <p className="text-muted-foreground">
              {m.auth_login_redirecting()}
            </p>
          </div>
        </div>
      ) : null}
      <AuthCard
        headerLabel={m.auth_login_welcome_back()}
        bottomButtonPrefix={m.auth_login_sign_up_hint()}
        bottomButtonLabel={m.auth_login_sign_up_link()}
        bottomButtonHref={onSwitchToSignup ? undefined : bottomButtonHref}
        onBottomButtonClick={onSwitchToSignup}
        showBrand={false}
        className={className}
      >
        <div className="space-y-4">
          {emailOtpLoginEnabled ? (
            <EmailOtpForm
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              onSuccess={handleSuccess}
              labels={labels}
              error={error || urlErrorMessage}
              onErrorChange={setError}
              submitDisabled={isRedirecting}
              hideEmailLabel
            />
          ) : (
            <FormError message={error || urlErrorMessage} />
          )}

          {googleLoginEnabled ? (
            <SocialLoginButton
              callbackUrl={callbackUrl}
              showDivider={emailOtpLoginEnabled}
              googleLabel={m.auth_login_continue_with_google()}
            />
          ) : null}
        </div>
      </AuthCard>
    </>
  );
}
