import Container from '@/components/layout/container';
import { getDesktopDownloadCards } from '@/components/download/download-config';
import { DownloadPlatforms } from '@/components/download/download-platforms';
import { CtaButton } from '@/components/ui/cta-button';
import { websiteConfig } from '@/config/website';
import { getServerTranslations } from '@/lib/deskpet-i18n';
import { MailIcon } from 'lucide-react';

export function DownloadPage() {
  const t = getServerTranslations('DownloadPage');
  const cards = getDesktopDownloadCards();
  const supportEmail = websiteConfig.mail.supportEmail;

  const windowsSteps = [
    t('install.windows.steps.1'),
    t('install.windows.steps.2'),
    t('install.windows.steps.3'),
    t('install.windows.steps.4'),
  ] as const;
  const macSteps = [
    t('install.mac.steps.1'),
    t('install.mac.steps.2'),
    t('install.mac.steps.3'),
    t('install.mac.steps.4'),
  ] as const;

  return (
    <main className="bg-[#fffdf8] bg-[radial-gradient(circle,rgba(56,42,53,0.08)_1px,transparent_1px)] [background-size:28px_28px]">
      <Container className="px-6 py-[70px] sm:px-6">
        <div className="mx-auto max-w-[1100px] pb-16">
          <header className="mb-12 text-center sm:mb-[50px]">
            <h1 className="m-0 text-balance text-[42px] font-black tracking-[-2px] text-deskpet-ink sm:text-[56px]">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-[650px] text-balance text-lg leading-relaxed text-deskpet-muted">
              {t('intro')}
            </p>
          </header>

          <DownloadPlatforms cards={cards} />

          <section
            id="install"
            className="mt-12 scroll-mt-24 grid gap-6 sm:grid-cols-2"
          >
            <div className="rounded-3xl border-2 border-deskpet-ink bg-white p-6 shadow-[6px_6px_0_0_rgba(56,42,53,0.12)] sm:p-8">
              <h2 className="m-0 text-2xl font-black text-deskpet-ink">
                {t('install.windows.title')}
              </h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-deskpet-ink">
                {windowsSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border-2 border-deskpet-ink bg-white p-6 shadow-[6px_6px_0_0_rgba(56,42,53,0.12)] sm:p-8">
              <h2 className="m-0 text-2xl font-black text-deskpet-ink">
                {t('install.mac.title')}
              </h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-deskpet-ink">
                {macSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </section>

          {supportEmail ? (
            <section className="mt-12 text-center">
              <p className="text-[15px] text-deskpet-muted">
                {t('contact.prompt')}
              </p>
              <CtaButton asChild className="mt-5 rounded-2xl text-[17px]">
                <a href={`mailto:${supportEmail}`}>
                  <MailIcon className="size-5" aria-hidden />
                  {t('contact.cta')}
                </a>
              </CtaButton>
            </section>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
