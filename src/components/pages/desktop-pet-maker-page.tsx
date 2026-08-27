'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { MarketingToolsShell } from '@/components/tools/marketing-tools-shell';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useLocalePathname } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';

const STEP_IDS = ['photos', 'basics', 'details'] as const;
const WHAT_YOU_GET_IDS = ['profile', 'actions', 'play', 'care'] as const;

export function DesktopPetMakerPage() {
  const t = useTranslations('CreatePetWizard');
  const tSteps = useTranslations('CreatePetWizard.seoSteps');
  const tContent = useTranslations('CreatePetWizard.seoContent');
  const pathname = useLocalePathname();

  return (
    <MarketingToolsShell>
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
        <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-[#155b43]">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2 m-0 text-balance font-sans text-[clamp(2rem,5vw,3rem)] font-black tracking-tight text-deskpet-ink">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 m-0 max-w-2xl text-base font-medium leading-7 text-deskpet-muted">
          {t('description')}
        </p>
      </header>

      <div className="mx-auto max-w-3xl rounded-[28px] border-[3px] border-deskpet-ink bg-deskpet-paper p-8 text-center shadow-[8px_8px_0_0_rgba(55,39,51,0.1)]">
        <p className="m-0 text-base font-medium text-deskpet-muted">
          {t('steps.photos.title')} → {t('steps.basics.title')} →{' '}
          {t('steps.details.title')}
        </p>
        <LoginWrapper mode="modal" asChild callbackUrl={pathname}>
          <Button variant="brutal" size="lg" className="mt-6 min-h-12 px-8">
            {t('steps.photos.cta')}
          </Button>
        </LoginWrapper>
      </div>

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="text-center text-2xl font-black text-deskpet-ink">
          {tContent('whatYouGet.title')}
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {WHAT_YOU_GET_IDS.map((id) => (
            <li
              key={id}
              className="rounded-2xl border-2 border-deskpet-ink/15 bg-white p-5 text-sm font-bold text-deskpet-ink"
            >
              {tContent(`whatYouGet.items.${id}`)}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-2xl font-black text-deskpet-ink">
          {tSteps('title')}
        </h2>
        <ol className="mt-6 space-y-4">
          {STEP_IDS.map((id, index) => (
            <li
              key={id}
              className="rounded-2xl border-2 border-deskpet-ink bg-white p-5 shadow-[4px_4px_0_0_rgba(55,39,51,0.08)]"
            >
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#155b43]">
                Step {index + 1}
              </span>
              <p className="mt-2 m-0 font-black text-deskpet-ink">
                {tSteps(`${id}.title`)}
              </p>
              <p className="mt-1 m-0 text-sm font-medium text-deskpet-muted">
                {tSteps(`${id}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-deskpet-muted">
        Already have an account?{' '}
        <a
          href={Routes.DashboardActions}
          className="font-bold text-deskpet-ink underline"
        >
          Open your dashboard
        </a>{' '}
        to continue building your pet.
      </p>
    </MarketingToolsShell>
  );
}
