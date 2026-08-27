import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { IconLoader2, IconX } from '@tabler/icons-react';
import { useState } from 'react';

export interface EmailOtpFormLabels {
  email: string;
  emailPlaceholder: string;
  verificationCode: string;
  codeSentHint: string;
  continue: string;
  clearEmail: string;
  pleaseEnterCode: string;
  changeEmail: string;
  resendCode: string;
}

export interface EmailOtpFormProps {
  onSendOtp: (email: string, options?: { isResend?: boolean }) => Promise<void>;
  onVerifyOtp: (email: string, otp: string) => Promise<void>;
  onSuccess?: () => void;
  onVerificationChange?: (email: string | null) => void;
  labels: EmailOtpFormLabels;
  error?: string;
  onErrorChange?: (error: string | undefined) => void;
  submitDisabled?: boolean;
  className?: string;
  hideEmailLabel?: boolean;
  beforeSubmit?: React.ReactNode;
}

export function EmailOtpForm({
  onSendOtp,
  onVerifyOtp,
  onSuccess,
  onVerificationChange,
  labels,
  error = '',
  onErrorChange,
  submitDisabled = false,
  className,
  hideEmailLabel = false,
  beforeSubmit,
}: EmailOtpFormProps) {
  const [email, setEmail] = useState('');
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null
  );
  const [otp, setOtp] = useState('');
  const [isPending, setIsPending] = useState(false);

  const setError = (msg: string | undefined) => {
    onErrorChange?.(msg);
  };

  const enterVerification = (nextEmail: string) => {
    setVerificationEmail(nextEmail);
    onVerificationChange?.(nextEmail);
  };

  const leaveVerification = () => {
    setVerificationEmail(null);
    onVerificationChange?.(null);
  };

  const clearEmailAndOtp = () => {
    setEmail('');
    leaveVerification();
    setOtp('');
    setError(undefined);
  };

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(undefined);
    setIsPending(true);
    try {
      await onSendOtp(trimmed);
      enterVerification(trimmed);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Something went wrong'
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !verificationEmail) {
      setError(labels.pleaseEnterCode);
      return;
    }
    setError(undefined);
    setIsPending(true);
    try {
      await onVerifyOtp(verificationEmail, otp);
      onSuccess?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Verification failed'
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleResend = async () => {
    if (!verificationEmail) return;
    setError(undefined);
    setIsPending(true);
    try {
      await onSendOtp(verificationEmail, { isResend: true });
      setOtp('');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Something went wrong'
      );
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (verificationEmail) {
      void handleVerifyOtp();
    } else {
      void handleSendOtp();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="space-y-3">
        <div className="space-y-2">
          {hideEmailLabel ? (
            <Label htmlFor="email-otp-email" className="sr-only">
              {labels.email}
            </Label>
          ) : (
            <Label htmlFor="email-otp-email">{labels.email}</Label>
          )}
          <div className="relative">
            <Input
              id="email-otp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                const value = event.target.value;
                setEmail(value);
                if (verificationEmail) {
                  leaveVerification();
                  setOtp('');
                }
              }}
              disabled={isPending || submitDisabled || !!verificationEmail}
              placeholder={labels.emailPlaceholder}
              className={cn(
                'h-11 rounded-lg border-deskpet-ink/20 bg-background px-3 text-sm',
                email ? 'pr-9' : ''
              )}
            />
            {email && !verificationEmail ? (
              <button
                type="button"
                onClick={clearEmailAndOtp}
                disabled={isPending || submitDisabled}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                aria-label={labels.clearEmail}
              >
                <IconX className="size-4" />
              </button>
            ) : null}
          </div>
          {verificationEmail ? (
            <button
              type="button"
              onClick={clearEmailAndOtp}
              disabled={isPending || submitDisabled}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {labels.changeEmail}
            </button>
          ) : null}
        </div>

        {verificationEmail ? (
          <div className="space-y-2">
            <Label htmlFor="email-otp-code" className="sr-only">
              {labels.verificationCode}
            </Label>
            <Input
              id="email-otp-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              disabled={isPending || submitDisabled}
              placeholder={labels.verificationCode}
              autoFocus
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              className="h-11 rounded-lg border-deskpet-ink/20 bg-background px-3 text-sm tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              {labels.codeSentHint}{' '}
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isPending || submitDisabled}
                className="underline-offset-4 hover:underline disabled:opacity-50"
              >
                {labels.resendCode}
              </button>
            </p>
          </div>
        ) : (
          beforeSubmit
        )}
      </div>

      <FormError message={error || undefined} />

      <Button
        type="submit"
        disabled={isPending || submitDisabled}
        size="lg"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-deskpet-ink bg-deskpet-ink font-semibold text-white hover:bg-deskpet-ink/90 dark:border-foreground dark:bg-foreground dark:text-background"
      >
        {isPending ? <IconLoader2 className="size-4 animate-spin" /> : null}
        <span>{labels.continue}</span>
      </Button>
    </form>
  );
}
