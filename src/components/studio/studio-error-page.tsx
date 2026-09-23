import * as Sentry from '@sentry/tanstackstart-react';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconRefresh,
} from '@tabler/icons-react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';

export function StudioErrorPage({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <StudioErrorPanel
      title="Something went wrong in Studio"
      description="We couldn't load this Studio page. Try again, or return to the Studio home."
      action={
        <button
          type="button"
          className="studio-button studio-button-primary"
          onClick={reset}
        >
          <IconRefresh />
          Try again
        </button>
      }
    />
  );
}

export function StudioNotFoundPage() {
  return (
    <StudioErrorPanel
      title="This Studio page doesn't exist"
      description="The page may have moved, or the link may no longer be available."
    />
  );
}

function StudioErrorPanel({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <main id="studio-content" className="studio-error-page">
      <section className="studio-error-panel">
        <span className="studio-error-icon" aria-hidden="true">
          <IconAlertTriangle />
        </span>
        <p>DeskPet Studio</p>
        <h1>{title}</h1>
        <span>{description}</span>
        <div className="studio-error-actions">
          {action}
          <LocaleLink href={Routes.Studio} className="studio-button">
            <IconArrowLeft />
            Back to Studio
          </LocaleLink>
        </div>
      </section>
    </main>
  );
}
