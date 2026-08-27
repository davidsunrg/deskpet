'use client';

import { CtaButton } from '@/components/ui/cta-button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';

export function DashboardOverviewContent() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border-2 border-deskpet-ink/10 bg-deskpet-paper p-8 shadow-[5px_5px_0_0_rgba(55,39,51,0.08)]">
      <h2 className="text-2xl font-black tracking-tight text-deskpet-ink">
        Welcome to your dashboard
      </h2>
      <p className="mt-3 text-sm leading-6 text-deskpet-muted">
        Pet ownership and workspace features are coming soon. For now, create a
        custom desktop pet or explore the public catalog and playground.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <CtaButton asChild>
          <LocaleLink href={Routes.DesktopPetCreator}>Create a pet</LocaleLink>
        </CtaButton>
        <CtaButton variant="brutalOutline" asChild>
          <LocaleLink href={Routes.Pets}>Browse pets</LocaleLink>
        </CtaButton>
        <CtaButton variant="brutalOutline" asChild>
          <LocaleLink href={Routes.Playground}>Open playground</LocaleLink>
        </CtaButton>
      </div>
    </div>
  );
}
