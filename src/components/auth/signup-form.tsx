import { signupWithOtpFn } from '@/api/auth-signup';
import { getAuthErrorMessage } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { AuthCard } from '@/components/auth/auth-card';
import {
  authFieldClass,
  authLabelClass,
  authSubmitClass,
} from '@/components/auth/auth-form-styles';
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
import { DEFAULT_LOGIN_REDIRECT, Routes } from '@/lib/routes';
import { getPathWithLocale } from '@/lib/urls';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SocialLoginButton } from './social-login-button';

interface SignupFormProps {
  className?: string;
  callbackUrl?: string;
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  bottomButtonHref?: string;
}

export function SignupForm({
  className,
  callbackUrl: propCallbackUrl,
  onSuccess,
  onSwitchToLogin,
  bottomButtonHref = Routes.Login,
}: SignupFormProps) {
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
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState('');

  const SignupSchema = z.object({
    name: z.string().min(1, { message: m.auth_register_name_required() }),
    email: z.email({ message: m.auth_register_email_required() }),
  });

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: '', name: '' },
  });

  const handleSuccess = () => {
    onSuccess?.();
    if (!onSuccess) {
      router.navigate({ to: callbackUrl });
    }
    void router.invalidate();
  };

  const onSubmit = async (values: z.infer<typeof SignupSchema>) => {
    setIsPending(true);
    setError(undefined);
    try {
      await signupWithOtpFn({ data: values });
      setEmail(values.email);
      setStep('otp');
    } catch (caught) {
      setError(
        getAuthErrorMessage(
          caught instanceof Error
            ? { message: caught.message }
            : { message: m.auth_error_try_again() }
        )
      );
    } finally {
      setIsPending(false);
    }
  };

  if (step === 'otp') {
    return (
      <AuthCard
        headerLabel={m.auth_signup_create_account()}
        bottomButtonLabel={m.auth_signup_sign_in_hint()}
        bottomButtonHref={bottomButtonHref}
        onBottomButtonClick={onSwitchToLogin}
        className={className}
      >
        <EmailOtpForm
          email={email}
          otpType="email-verification"
          onBack={() => setStep('details')}
          onSuccess={handleSuccess}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      headerLabel={m.auth_signup_create_account()}
      bottomButtonLabel={m.auth_signup_sign_in_hint()}
      bottomButtonHref={bottomButtonHref}
      onBottomButtonClick={onSwitchToLogin}
      className={className}
    >
      {(websiteConfig.auth?.enableEmailOtpLogin ?? false) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={authLabelClass(true)}>
                      {m.auth_register_name()}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={m.auth_register_placeholder_name()}
                        name="name"
                        className={authFieldClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={authLabelClass()}>
                      {m.auth_register_email()}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder={m.auth_register_placeholder_email()}
                        type="email"
                        name="email"
                        className={authFieldClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <Button
              disabled={isPending}
              type="submit"
              className={authSubmitClass}
            >
              {isPending && (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              )}
              {m.auth_otp_continue()}
            </Button>
          </form>
        </Form>
      )}
      <SocialLoginButton
        callbackUrl={callbackUrl}
        showDivider={websiteConfig.auth?.enableEmailOtpLogin ?? false}
      />
    </AuthCard>
  );
}
