import { CreatePetWizardShell } from '@/components/tools/create-pet-wizard-shell';
import { DesktopPetMakerPetShowcase } from '@/components/tools/desktop-pet-maker-pet-showcase';
import { MarketingToolsShell } from '@/components/tools/marketing-tools-shell';
import { useTranslations } from '@/lib/deskpet-i18n';
import type { ShowcasePet } from '@/utils/showcase-pets';

const WHAT_YOU_GET_IDS = ['profile', 'actions', 'play', 'care'] as const;
const WHO_FOR_IDS = ['owners', 'curious', 'creators'] as const;
const FAQ_IDS = [
  'what',
  'photos',
  'presets',
  'after',
  'platforms',
  'edit',
] as const;
const STEP_IDS = ['photos', 'basics', 'details'] as const;

type DesktopPetMakerPageProps = {
  heroPets: ShowcasePet[];
};

export function DesktopPetMakerPage({ heroPets }: DesktopPetMakerPageProps) {
  const tSteps = useTranslations('CreatePetWizard.seoSteps');
  const tContent = useTranslations('CreatePetWizard.seoContent');
  const tFaq = useTranslations('CreatePetWizard.faq');

  return (
    <MarketingToolsShell>
      <CreatePetWizardShell />

      <section
        className="mx-auto mt-14 max-w-7xl border-t-2 border-deskpet-ink/10 pt-10"
        aria-labelledby="desktop-pet-maker-steps-title"
      >
        <div className="max-w-3xl">
          <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
            {tSteps('eyebrow')}
          </p>
          <h2
            id="desktop-pet-maker-steps-title"
            className="mt-2 m-0 font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-deskpet-ink"
          >
            {tSteps('title')}
          </h2>
          <p className="mt-3 m-0 text-base leading-7 text-deskpet-muted">
            {tSteps('description')}
          </p>
        </div>

        <ol className="mt-7 grid list-none gap-3 p-0 sm:grid-cols-2">
          {STEP_IDS.map((stepId, index) => (
            <li
              key={stepId}
              className="grid gap-2 rounded-2xl border-2 border-deskpet-ink/10 bg-white px-4 py-4"
            >
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#18866d]">
                {tSteps('stepLabel', { number: index + 1 })}
              </span>
              <h3 className="m-0 text-base font-black text-deskpet-ink">
                {tSteps(`items.${stepId}.title`)}
              </h3>
              <p className="m-0 text-sm leading-6 text-deskpet-muted">
                {tSteps(`items.${stepId}.description`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <DesktopPetMakerPetShowcase pets={heroPets} />

      <section
        className="mx-auto mt-14 max-w-7xl border-t-2 border-deskpet-ink/10 pt-10"
        aria-labelledby="desktop-pet-maker-results-title"
      >
        <div className="max-w-3xl">
          <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
            {tContent('whatYouGet.eyebrow')}
          </p>
          <h2
            id="desktop-pet-maker-results-title"
            className="mt-2 m-0 font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-deskpet-ink"
          >
            {tContent('whatYouGet.title')}
          </h2>
          <p className="mt-3 m-0 text-base leading-7 text-deskpet-muted">
            {tContent('whatYouGet.intro')}
          </p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {WHAT_YOU_GET_IDS.map((id) => (
            <article
              key={id}
              className="rounded-2xl border-2 border-deskpet-ink/10 bg-white px-4 py-4"
            >
              <h3 className="m-0 text-base font-black text-deskpet-ink">
                {tContent(`whatYouGet.items.${id}.title`)}
              </h3>
              <p className="mt-2 m-0 text-sm leading-6 text-deskpet-muted">
                {tContent(`whatYouGet.items.${id}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto mt-14 max-w-7xl border-t-2 border-deskpet-ink/10 pt-10"
        aria-labelledby="desktop-pet-maker-audience-title"
      >
        <div className="max-w-3xl">
          <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
            {tContent('whoFor.eyebrow')}
          </p>
          <h2
            id="desktop-pet-maker-audience-title"
            className="mt-2 m-0 font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-deskpet-ink"
          >
            {tContent('whoFor.title')}
          </h2>
          <p className="mt-3 m-0 text-base leading-7 text-deskpet-muted">
            {tContent('whoFor.intro')}
          </p>
        </div>
        <div className="mt-7 grid gap-4">
          {WHO_FOR_IDS.map((id) => (
            <article
              key={id}
              className="rounded-2xl border-2 border-deskpet-ink/10 bg-white px-4 py-4"
            >
              <h3 className="m-0 text-base font-black text-deskpet-ink">
                {tContent(`whoFor.items.${id}.title`)}
              </h3>
              <p className="mt-2 m-0 text-sm leading-6 text-deskpet-muted">
                {tContent(`whoFor.items.${id}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="mx-auto mt-14 max-w-7xl border-t-2 border-deskpet-ink/10 pt-10 pb-4"
        aria-labelledby="desktop-pet-maker-faq-title"
      >
        <div className="max-w-3xl">
          <p className="m-0 text-sm font-black uppercase tracking-[0.16em] text-deskpet-muted">
            {tFaq('eyebrow')}
          </p>
          <h2
            id="desktop-pet-maker-faq-title"
            className="mt-2 m-0 font-sans text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-deskpet-ink"
          >
            {tFaq('title')}
          </h2>
        </div>
        <dl className="mt-7 grid gap-4">
          {FAQ_IDS.map((id) => (
            <div
              key={id}
              className="rounded-2xl border-2 border-deskpet-ink/10 bg-white px-4 py-4"
            >
              <dt className="m-0 text-base font-black text-deskpet-ink">
                {tFaq(`items.${id}.question`)}
              </dt>
              <dd className="mt-2 m-0 text-sm leading-6 text-deskpet-muted">
                {tFaq(`items.${id}.answer`)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </MarketingToolsShell>
  );
}
