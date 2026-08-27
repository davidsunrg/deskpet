'use client';

import { MarketingToolsShell } from '@/components/tools/marketing-tools-shell';
import { useTranslations } from '@/lib/deskpet-i18n';

export function PetVideoMakerPage() {
  const t = useTranslations('PetVideoMakerPage');

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

      <div className="mx-auto max-w-3xl rounded-[28px] border-[3px] border-deskpet-ink bg-[#fbf7ef] p-10 text-center shadow-[8px_8px_0_0_rgba(55,39,51,0.1)]">
        <p className="m-0 text-base font-medium leading-relaxed text-deskpet-muted">
          {t('comingSoon.description')}
        </p>
      </div>
    </MarketingToolsShell>
  );
}
