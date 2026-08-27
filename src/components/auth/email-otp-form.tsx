import { getAuthErrorMessage } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { FormError } from '@/components/shared/form-error';
import { FormSuccess } from '@/components/shared/form-success';
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
import { authClient } from '@/auth/client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type OtpType = 'sign-in' | 'email-verification';

interface EmailOtpFormProps {
  email: string;
  otpType: OtpType;
  className?: string;
  onBack?: () => void;
  onSuccess?: () => void;
  verifyOtp?: (otp: string) => Promise<void>;
}

export function EmailOtpForm({
  email,
  otpType,
  className,
  onBack,
  onSuccess,
  verifyOtp,
}: EmailOtpFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, setIsPending] = useState(false);

  const OtpSchema = z.object({
    otp: z
      .string()
      .min(6, { message: m.auth_otp_code_required() })
      .max(6, { message: m.auth_otp_code_required() }),
  });

  const form = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: '' },
  });

  const sendOtp = async () => {
    await authClient.emailOtp.sendVerificationOtp(
      { email, type: otpType },
      {
        onRequest: () => {
          setIsPending(true);
          setError(undefined);
        },
        onResponse: () => setIsPending(false),
        onSuccess: () => setSuccess(m.auth_otp_sent()),
        onError: (ctx) => setError(getAuthErrorMessage(ctx.error)),
      }
    );
  };

  const onSubmit = async (values: z.infer<typeof OtpSchema>) => {
    setIsPending(true);
    setError(undefined);
    try {
      if (verifyOtp) {
        await verifyOtp(values.otp);
      } else if (otpType === 'sign-in') {
        const result = await authClient.signIn.emailOtp({
          email,
          otp: values.otp,
        });
        if (result.error) {
          throw result.error;
        }
      } else {
        const result = await authClient.emailOtp.verifyEmail({
          email,
          otp: values.otp,
        });
        if (result.error) {
          throw result.error;
        }
      }
      onSuccess?.();
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

  return (
    <div className={cn('space-y-6', className)}>
      <FormSuccess message={success ?? m.auth_otp_sent()} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{m.auth_otp_code()}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    disabled={isPending}
                    placeholder={m.auth_otp_placeholder_code()}
                    name="otp"
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
            {isPending && <IconLoader2 className="mr-2 size-4 animate-spin" />}
            {m.auth_otp_verify()}
          </Button>
        </form>
      </Form>
      <div className="flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          className="text-muted-foreground hover:text-primary hover:underline"
          onClick={() => void sendOtp()}
          disabled={isPending}
        >
          {m.auth_otp_resend()}
        </button>
        {onBack ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-primary hover:underline"
            onClick={onBack}
            disabled={isPending}
          >
            {m.auth_otp_use_different_email()}
          </button>
        ) : null}
      </div>
    </div>
  );
}
