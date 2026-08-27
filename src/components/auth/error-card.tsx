import { getAuthErrorMessages } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { AuthCard } from '@/components/auth/auth-card';
import { Routes } from '@/lib/routes';
import { IconAlertTriangle } from '@tabler/icons-react';

function getDisplayMessage(
  errorCode: string | undefined,
  errorDescription: string | undefined
): string {
  const authErrorMessages = getAuthErrorMessages();
  if (errorCode && authErrorMessages[errorCode]) {
    return authErrorMessages[errorCode];
  }
  if (errorDescription) {
    return errorDescription;
  }
  if (errorCode) {
    return errorCode;
  }
  return m.auth_error_try_again();
}

export function ErrorCard({
  errorCode,
  errorDescription,
}: {
  errorCode?: string;
  errorDescription?: string;
} = {}) {
  const displayMessage = getDisplayMessage(errorCode, errorDescription);
  return (
    <AuthCard
      headerLabel={m.auth_error_title()}
      bottomButtonHref={Routes.Login}
      bottomButtonLabel={m.auth_error_back_to_login()}
      showBrand={false}
    >
      <div className="flex w-full flex-col items-center justify-center gap-2 py-4">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-4 shrink-0 text-destructive" />
          <p className="text-center font-medium text-destructive">
            {displayMessage}
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
