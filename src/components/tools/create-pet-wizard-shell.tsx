'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { Button } from '@/components/ui/button';
import { CtaButton } from '@/components/ui/cta-button';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useLocalePathname } from '@/lib/i18n/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageIcon,
  PlusIcon,
} from 'lucide-react';

const WIZARD_STEPS = ['photos', 'basics', 'details'] as const;

const wizardCardClass =
  'rounded-[22px] border-2 border-deskpet-ink/12 bg-white shadow-[4px_4px_0_0_rgba(55,39,51,0.06)]';

/**
 * Visible wizard shell for SEO parity. Full upload/recognition pipeline is
 * wired after auth in a follow-up pass; CTAs open login with callback here.
 */
export function CreatePetWizardShell() {
  const t = useTranslations('CreatePetWizard');
  const pathname = useLocalePathname();

  return (
    <div
      translate="no"
      data-google-translate="no"
      className="notranslate mx-auto flex max-w-7xl flex-col gap-6 pb-12"
    >
      <header className="text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-deskpet-muted">
          {t('eyebrow')}
        </p>
        <h1 className="font-sans text-[clamp(2rem,5vw,4rem)] font-black tracking-tight text-deskpet-ink">
          {t('title')}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-deskpet-muted">
          {t('description')}
        </p>
      </header>

      <ol className="grid select-none gap-2 rounded-[22px] border-2 border-deskpet-ink/12 bg-white p-2 sm:grid-cols-3">
        {WIZARD_STEPS.map((item, index) => {
          const active = item === 'photos';
          return (
            <li key={item} className="min-w-0">
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex min-h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-bold ${
                  active
                    ? 'bg-deskpet-mint text-deskpet-ink'
                    : 'cursor-not-allowed text-deskpet-muted opacity-60'
                }`}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-xs text-deskpet-ink">
                  {index + 1}
                </span>
                {t(`steps.${item}`)}
              </span>
            </li>
          );
        })}
      </ol>

      <section className={`${wizardCardClass} p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-deskpet-mint-soft text-deskpet-ink">
            <ImageIcon className="size-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-lg font-black text-deskpet-ink">
              {t('photos.title')}
            </h2>
            <p className="mt-1 m-0 text-sm leading-6 text-deskpet-muted">
              {t('photos.description')}
            </p>
          </div>
        </div>

        <ul className="mt-4 m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          <li>
            <LoginWrapper mode="modal" asChild callbackUrl={pathname}>
              <button
                type="button"
                className="grid aspect-square w-full place-items-center rounded-2xl border-2 border-dashed border-deskpet-ink/25 bg-white text-center text-sm font-bold text-deskpet-muted transition-colors hover:bg-deskpet-mint-soft"
              >
                <span className="grid gap-2 place-items-center">
                  <PlusIcon className="size-7" aria-hidden />
                  {t('photos.add')}
                </span>
              </button>
            </LoginWrapper>
          </li>
        </ul>
      </section>

      <footer className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" disabled>
            <ArrowLeftIcon className="size-4" aria-hidden />
            {t('nav.back')}
          </Button>
        </div>
        <LoginWrapper mode="modal" asChild callbackUrl={pathname}>
          <CtaButton type="button">
            {t('nav.continue')}
            <ArrowRightIcon className="size-4" aria-hidden />
          </CtaButton>
        </LoginWrapper>
      </footer>
    </div>
  );
}
