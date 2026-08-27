'use client';

import { useTranslations } from '@/lib/deskpet-i18n';
import Container from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { CheckIcon, PawPrintIcon } from 'lucide-react';

const expenseRows = [
  { key: 'food', icon: '🥣', tone: 'bg-[#fff2c8]' },
  { key: 'vet', icon: '🩺', tone: 'bg-[#eee5ff]' },
  { key: 'toy', icon: '🧶', tone: 'bg-[#ffe7ec]' },
  { key: 'grooming', icon: '✂️', tone: 'bg-[#def7ed]' },
] as const;

const benefitCards = [
  { key: 'remember', icon: '🧾', tone: 'bg-[#def7ed]' },
  { key: 'patterns', icon: '📊', tone: 'bg-[#fff2c8]' },
  { key: 'plan', icon: '🛟', tone: 'bg-[#eee5ff]' },
] as const;

const categoryBars = [
  { name: 'Food', value: '$96', width: 'w-[82%]', color: 'bg-[#ffd767]' },
  { name: 'Vet', value: '$82', width: 'w-[70%]', color: 'bg-[#9f7aea]' },
  { name: 'Grooming', value: '$44', width: 'w-[38%]', color: 'bg-[#55d9aa]' },
  { name: 'Toys', value: '$28', width: 'w-[24%]', color: 'bg-[#ef8ea3]' },
  { name: 'Other', value: '$18', width: 'w-[16%]', color: 'bg-[#9bc8ec]' },
] as const;

const receiptCards = [
  {
    title: 'Green Paws Vet',
    amount: '$128',
    rows: [
      ['Annual checkup', 'Jul 10'],
      ['Attached', 'receipt.pdf'],
    ],
    className: 'left-2 top-4 rotate-[-4deg] bg-white',
  },
  {
    title: 'PawBox',
    amount: '$48.90',
    rows: [
      ['Food delivery', 'Jul 16'],
      ['Recurring', 'Monthly'],
    ],
    className: 'right-1 top-[82px] rotate-[4deg] bg-[#fff2c8]',
  },
  {
    title: 'Grooming',
    amount: '$18',
    rows: [
      ['Nail trim', 'Jul 2'],
      ['Note', 'Next in 6 weeks'],
    ],
    className: 'bottom-1 left-[72px] rotate-[-1deg] bg-[#def7ed]',
  },
] as const;

const categoryCards = [
  { key: 'food', icon: '🥣' },
  { key: 'vet', icon: '🩺' },
  { key: 'grooming', icon: '✂️' },
  { key: 'supplies', icon: '🧸' },
  { key: 'insurance', icon: '🛡️' },
  { key: 'boarding', icon: '🏡' },
  { key: 'travel', icon: '✈️' },
  { key: 'custom', icon: '✨' },
] as const;

const faqItems = ['manual', 'multiplePets', 'medical'] as const;

function SectionHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.08em] text-[#155b43]">
          {kicker}
        </span>
        <h2 className="max-w-[650px] text-[clamp(2.25rem,5vw,3.125rem)] font-black leading-[1.04] tracking-tight text-[#382a35]">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-[630px] text-base leading-relaxed text-[#7d6875]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function CheckList({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-6 grid gap-3">
      {items.map((item) => (
        <div className="flex items-start gap-3 font-extrabold" key={item}>
          <span className="grid size-7 shrink-0 place-items-center rounded-[9px] border-2 border-[#382a35] bg-[#55d9aa]">
            <CheckIcon className="size-4" aria-hidden />
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function ExpensePage() {
  const t = useTranslations('ExpensePage');

  const categoryChecks = [
    t('categoriesSummary.checks.monthly'),
    t('categoriesSummary.checks.separate'),
    t('categoriesSummary.checks.custom'),
  ] as const;

  const receiptChecks = [
    t('receipts.checks.attachment'),
    t('receipts.checks.notes'),
    t('receipts.checks.linked'),
  ] as const;

  return (
    <main className="bg-[#fffdf8] bg-[radial-gradient(circle,rgba(56,42,53,0.12)_1px,transparent_1px)] [background-size:30px_30px]">
      <Container className="px-4 py-12 md:py-18">
        <div className="mx-auto max-w-7xl space-y-12 pb-16">
          <section className="grid items-center gap-11 lg:grid-cols-[0.94fr_1.06fr]">
            <div>
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#382a35]/20 bg-white px-3.5 py-2 text-[13px] font-black text-[#382a35]">
                💸 {t('hero.eyebrow')}
              </span>
              <h1 className="mb-5 max-w-[650px] text-[clamp(3.25rem,7vw,4.875rem)] font-black leading-[0.98] tracking-tight text-[#382a35]">
                {t('hero.title')}
              </h1>
              <p className="mb-7 max-w-[620px] text-[19px] leading-relaxed text-[#7d6875]">
                {t('hero.description')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="xl" variant="brutal">
                  <LocaleLink href={Routes.DesktopPetCreator}>
                    <PawPrintIcon className="size-5" aria-hidden />
                    {t('hero.primaryCta')}
                  </LocaleLink>
                </Button>
                <Button asChild size="xl" variant="brutalSecondary">
                  <a href="#how">{t('hero.secondaryCta')}</a>
                </Button>
              </div>
              <p className="mt-5 text-[13px] font-bold text-[#7d6875]">
                {t('hero.note')}
              </p>
            </div>

            <div className="relative min-h-[590px] overflow-hidden rounded-[34px] border-[3px] border-[#382a35] bg-[radial-gradient(circle_at_82%_18%,rgba(159,122,234,0.22),transparent_25%),radial-gradient(circle_at_15%_82%,rgba(85,217,170,0.22),transparent_28%),linear-gradient(180deg,#fff3cd_0%,#fffaf0_100%)] p-6 shadow-[10px_12px_0_0_rgba(56,42,53,0.14)] sm:p-8">
              <span className="inline-flex rounded-full border-2 border-[#155b43]/20 bg-[#def7ed] px-3.5 py-2 text-sm font-black text-[#155b43]">
                {t('preview.badge')}
              </span>

              <div className="relative mt-6 rounded-[26px] border-2 border-[#382a35] bg-white/95 p-5 shadow-[7px_8px_0_0_rgba(56,42,53,0.11)]">
                <div className="flex flex-col gap-4 border-b-2 border-dashed border-[#382a35]/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-[46px] place-items-center rounded-[15px] border-2 border-[#382a35] bg-[#fff2c8] text-2xl">
                      🐈
                    </div>
                    <div>
                      <strong className="block">{t('preview.petName')}</strong>
                      <span className="block text-xs text-[#7d6875]">
                        {t('preview.petMeta')}
                      </span>
                    </div>
                  </div>
                  <div className="w-fit rounded-full border-2 border-[#382a35]/20 bg-[#fff9ee] px-3 py-2 text-xs font-black">
                    {t('preview.month')}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[20px] border-2 border-[#382a35] bg-[#def7ed] p-4">
                    <span className="text-xs font-extrabold text-[#7d6875]">
                      {t('preview.spentLabel')}
                    </span>
                    <strong className="mt-1.5 block text-[34px] tracking-tight">
                      {t('preview.spentAmount')}
                    </strong>
                    <p className="mt-1.5 text-xs font-extrabold leading-normal text-[#155b43]">
                      {t('preview.delta')}
                    </p>
                  </div>
                  <div className="rounded-[20px] border-2 border-[#382a35] bg-[#eee5ff] p-4">
                    <span className="text-xs font-extrabold text-[#7d6875]">
                      {t('preview.budgetLabel')}
                    </span>
                    <strong className="mt-1.5 block text-[34px] tracking-tight">
                      {t('preview.budgetAmount')}
                    </strong>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80">
                      <span className="block h-full w-[68%] rounded-full bg-[#9f7aea]" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5">
                  {expenseRows.map((row) => (
                    <div
                      className="grid grid-cols-[44px_1fr] items-center gap-3 rounded-2xl border-2 border-[#382a35]/20 bg-white p-3 sm:grid-cols-[44px_1fr_auto]"
                      key={row.key}
                    >
                      <div
                        className={`grid size-[42px] place-items-center rounded-[14px] border-2 border-[#382a35] text-xl ${row.tone}`}
                      >
                        {row.icon}
                      </div>
                      <div>
                        <strong className="block">
                          {t(`preview.items.${row.key}.title`)}
                        </strong>
                        <span className="mt-1 block text-xs text-[#7d6875]">
                          {t(`preview.items.${row.key}.meta`)}
                        </span>
                      </div>
                      <div className="col-start-2 text-base font-black sm:col-start-auto">
                        {t(`preview.items.${row.key}.price`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-5 rounded-[18px] border-2 border-[#382a35] bg-[#ffe7ec] p-4 shadow-[5px_6px_0_0_rgba(56,42,53,0.14)] md:absolute md:right-5 md:bottom-5 md:mt-0 md:w-[218px] md:rotate-3">
                <strong className="mb-1 block">
                  💡 {t('preview.insightTitle')}
                </strong>
                <span className="text-xs leading-relaxed text-[#7d6875]">
                  {t('preview.insight')}
                </span>
              </div>
            </div>
          </section>

          <section className="py-4" id="how">
            <SectionHeader
              kicker={t('benefits.kicker')}
              title={t('benefits.title')}
              description={t('benefits.description')}
            />
            <div className="grid gap-4 md:grid-cols-3">
              {benefitCards.map((card) => (
                <article
                  className="flex min-h-[245px] flex-col rounded-3xl border-2 border-[#382a35] bg-[#fff9ee] p-6 shadow-[5px_6px_0_0_rgba(56,42,53,0.14)]"
                  key={card.key}
                >
                  <div
                    className={`grid size-[54px] place-items-center rounded-[17px] border-2 border-[#382a35] text-2xl ${card.tone}`}
                  >
                    {card.icon}
                  </div>
                  <h3 className="mt-auto text-[21px] font-black text-[#382a35]">
                    {t(`benefits.${card.key}.title`)}
                  </h3>
                  <p className="mt-2 leading-relaxed text-[#7d6875]">
                    {t(`benefits.${card.key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid items-center gap-8 rounded-[30px] border-[3px] border-[#382a35] bg-[linear-gradient(135deg,#fff9ee_0%,#f7f1ff_100%)] p-6 shadow-[8px_9px_0_0_rgba(56,42,53,0.14)] md:grid-cols-[0.92fr_1.08fr] md:p-8">
            <div>
              <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.08em] text-[#155b43]">
                {t('categoriesSummary.kicker')}
              </span>
              <h2 className="mb-4 text-[clamp(2.25rem,5vw,3.125rem)] font-black leading-[1.04] tracking-tight text-[#382a35]">
                {t('categoriesSummary.title')}
              </h2>
              <p className="text-[17px] leading-relaxed text-[#7d6875]">
                {t('categoriesSummary.description')}
              </p>
              <CheckList items={categoryChecks} />
            </div>
            <div className="min-h-[360px] rounded-3xl border-2 border-dashed border-[#382a35]/30 bg-white/70 p-5">
              <div className="grid gap-4">
                {categoryBars.map((bar) => (
                  <div
                    className="grid grid-cols-[82px_1fr_54px] items-center gap-3"
                    key={bar.name}
                  >
                    <span className="text-sm font-black">{bar.name}</span>
                    <div className="h-4 overflow-hidden rounded-full border-2 border-[#382a35] bg-white">
                      <span
                        className={`block h-full rounded-full ${bar.width} ${bar.color}`}
                      />
                    </div>
                    <span className="text-right text-sm font-black">
                      {bar.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid items-center gap-8 rounded-[30px] border-[3px] border-[#382a35] bg-[linear-gradient(135deg,#eafbf4_0%,#fff8dd_100%)] p-6 shadow-[8px_9px_0_0_rgba(56,42,53,0.14)] md:grid-cols-[1.08fr_0.92fr] md:p-8">
            <div className="order-2 min-h-[360px] overflow-hidden rounded-3xl border-2 border-dashed border-[#382a35]/30 bg-white/70 p-5 md:order-1">
              <div className="relative mx-auto min-h-[330px] max-w-[560px] scale-90 sm:scale-100">
                {receiptCards.map((card) => (
                  <div
                    className={`absolute w-[270px] rounded-[18px] border-2 border-[#382a35] p-4 shadow-[5px_6px_0_0_rgba(56,42,53,0.14)] ${card.className}`}
                    key={card.title}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 font-black">
                      <span>{card.title}</span>
                      <span>{card.amount}</span>
                    </div>
                    {card.rows.map(([label, value]) => (
                      <div
                        className="flex justify-between gap-3 border-t border-dashed border-[#382a35]/20 py-2 text-xs text-[#7d6875]"
                        key={label}
                      >
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.08em] text-[#155b43]">
                {t('receipts.kicker')}
              </span>
              <h2 className="mb-4 text-[clamp(2.25rem,5vw,3.125rem)] font-black leading-[1.04] tracking-tight text-[#382a35]">
                {t('receipts.title')}
              </h2>
              <p className="text-[17px] leading-relaxed text-[#7d6875]">
                {t('receipts.description')}
              </p>
              <CheckList items={receiptChecks} />
            </div>
          </section>

          <section className="py-4">
            <SectionHeader
              kicker={t('categories.kicker')}
              title={t('categories.title')}
              description={t('categories.description')}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categoryCards.map((card) => (
                <article
                  className="min-h-[170px] rounded-[22px] border-2 border-[#382a35] bg-white p-5 shadow-[4px_5px_0_0_rgba(56,42,53,0.14)] transition-shadow hover:shadow-[6px_8px_0_0_rgba(56,42,53,0.16)]"
                  key={card.key}
                >
                  <span className="block text-[32px]">{card.icon}</span>
                  <strong className="mt-7 block text-[17px] text-[#382a35]">
                    {t(`categories.${card.key}.title`)}
                  </strong>
                  <p className="mt-1.5 text-[13px] leading-normal text-[#7d6875]">
                    {t(`categories.${card.key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid items-center gap-7 rounded-[30px] border-[3px] border-[#382a35] bg-[linear-gradient(135deg,#def7ed,#fff7d9)] p-6 shadow-[9px_10px_0_0_rgba(56,42,53,0.14)] md:grid-cols-[1fr_0.78fr] md:p-10">
            <div>
              <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.08em] text-[#155b43]">
                {t('cta.kicker')}
              </span>
              <h2 className="mb-3 text-[clamp(2.25rem,5vw,3.125rem)] font-black leading-[1.04] tracking-tight text-[#382a35]">
                {t('cta.title')}
              </h2>
              <p className="text-[17px] leading-relaxed text-[#7d6875]">
                {t('cta.description')}
              </p>
            </div>
            <div className="rounded-[22px] border-2 border-[#382a35] bg-white/85 p-5">
              <strong className="mb-3 block text-lg">
                {t('cta.boxTitle')}
              </strong>
              <Button asChild size="xl" variant="brutal" className="w-full">
                <LocaleLink href={Routes.DesktopPetCreator}>
                  <PawPrintIcon className="size-5" aria-hidden />
                  {t('cta.button')}
                </LocaleLink>
              </Button>
            </div>
          </section>

          <section>
            <SectionHeader kicker={t('faq.kicker')} title={t('faq.title')} />
            <div className="grid gap-3">
              {faqItems.map((item) => (
                <details
                  className="rounded-[18px] border-2 border-[#382a35] bg-white shadow-[3px_4px_0_0_rgba(56,42,53,0.09)]"
                  key={item}
                >
                  <summary className="cursor-pointer px-5 py-4 font-black">
                    {t(`faq.${item}.question`)}
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-[#7d6875]">
                    {t(`faq.${item}.answer`)}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
