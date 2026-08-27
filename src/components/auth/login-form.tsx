import { getAuthErrorMessage } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { AuthCard } from '@/components/auth/auth-card';
import { EmailOtpForm } from '@/components/auth/email-otp-form';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { cn } from '@/lib/utils';
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SocialLoginButton } from './social-login-button';

interface LoginFormProps {
  className?: string;
  callbackUrl?: string;
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  bottomButtonHref?: string;
}

export function LoginForm({
  className,
  callbackUrl: propCallbackUrl,
  onSuccess,
  onSwitchToSignup,
  bottomButtonHref = Routes.Signup,
}: LoginFormProps) {
  const router = useRouter();
  const paramCallbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null;
  const defaultCallbackUrl = getPathWithLocale(DEFAULT_LOGIN_REDIRECT);
  const callbackUrl =
    propCallbackUrl ??
    (paramCallbackUrl ? paramCallbackUrl : defaultCallbackUrl);
  const [error, setError] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');

  const EmailSchema = z.object({
    email: z.email({ message: m.auth_login_email_required() }),
  });

  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: { email: '' },
  });

  const handleSuccess = () => {
    onSuccess?.();
    if (!onSuccess) {
      router.navigate({ to: callbackUrl });
    }
    void router.invalidate();
  };

  const onSubmit = async (values: z.infer<typeof EmailSchema>) => {
    setEmail(values.email);
    await authClient.emailOtp.sendVerificationOtp(
      { email: values.email, type: 'sign-in' },
      {
        onRequest: () => {
          setIsPending(true);
          setError(undefined);
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => setStep('otp'),
        onError: (ctx) => setError(getAuthErrorMessage(ctx.error)),
      }
    );
  };

  if (step === 'otp') {
    return (
      <AuthCard
        headerLabel={m.auth_login_welcome_back()}
        bottomButtonLabel={m.auth_login_sign_up_hint()}
        bottomButtonHref={bottomButtonHref}
        onBottomButtonClick={onSwitchToSignup}
        className={cn('', className)}
      >
        <EmailOtpForm
          email={email}
          otpType="sign-in"
          onBack={() => setStep('email')}
          onSuccess={handleSuccess}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      headerLabel={m.auth_login_welcome_back()}
      bottomButtonLabel={m.auth_login_sign_up_hint()}
      bottomButtonHref={bottomButtonHref}
      onBottomButtonClick={onSwitchToSignup}
      className={cn('', className)}
    >
      {(websiteConfig.auth?.enableEmailOtpLogin ?? false) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{m.auth_login_email()}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder={m.auth_login_placeholder_email()}
                      type="email"
                      name="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <Button
              disabled={isPending}
              size="lg"
              type="submit"
              className="w-full"
            >
              {isPending && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              {m.auth_otp_continue()}
            </Button>
          </form>
        </Form>
      )}
      <div className="mt-4">
        <SocialLoginButton
          callbackUrl={callbackUrl}
          showDivider={websiteConfig.auth?.enableEmailOtpLogin ?? false}
        />
      </div>
    </AuthCard>
  );
}
