'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

type FAQItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

export default function FaqSection() {
  const t = useTranslations('HomePage.faqs');

  const faqItems: FAQItem[] = [
    {
      id: 'item-1',
      question: t('items.item-1.question'),
      answer: t('items.item-1.answer'),
    },
    {
      id: 'item-2',
      question: t('items.item-2.question'),
      answer: t('items.item-2.answer'),
    },
    {
      id: 'item-3',
      question: t('items.item-3.question'),
      answer: t('items.item-3.answer'),
    },
    {
      id: 'item-4',
      question: t('items.item-4.question'),
      answer: t('items.item-4.answer'),
    },
    {
      id: 'item-5',
      question: t('items.item-5.question'),
      answer: (
        <>
          {t('items.item-5.answerBeforeLink')}
          <LocaleLink
            href={Routes.DesktopPetCreator}
            className="font-semibold text-deskpet-ink underline underline-offset-2 hover:text-[#155b43] dark:text-foreground"
          >
            {t('items.item-5.answerLinkLabel')}
          </LocaleLink>
          {t('items.item-5.answerAfterLink')}
        </>
      ),
    },
  ];

  return (
    <section id="faqs" className="px-4 pt-8 pb-16 md:pt-10 md:pb-20">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal>
          <HeaderSection
            title={t('title')}
            subtitle={t('subtitle')}
            className="items-center gap-2 text-center"
            titleClassName="text-[13px] font-black tracking-[0.08em] text-[#155b43] dark:text-deskpet-mint"
            subtitleClassName="text-balance text-[clamp(34px,5vw,48px)] font-black leading-[1.05] tracking-[-0.045em] text-deskpet-ink dark:text-foreground"
          />
        </ScrollReveal>

        <ScrollReveal delay={150} className="mt-[22px]">
          <Accordion type="single" collapsible className="grid w-full gap-3">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={cn(
                  'overflow-hidden rounded-[18px] border-2 border-deskpet-ink bg-white',
                  'shadow-[3px_4px_0_0_rgba(56,42,53,0.09)]',
                  'dark:border-border dark:bg-card dark:shadow-[3px_4px_0_0_rgba(0,0,0,0.35)]',
                  'not-last:border-b-2'
                )}
              >
                <AccordionTrigger
                  className={cn(
                    'items-center justify-start gap-3 px-5 py-[18px] text-left text-base font-extrabold text-deskpet-ink hover:no-underline dark:text-foreground',
                    '**:data-[slot=accordion-trigger-icon]:hidden'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block shrink-0 text-[10px] leading-none transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-90"
                  >
                    ▶
                  </span>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="px-5 pb-5 text-base font-medium leading-[1.65] text-deskpet-muted dark:text-muted-foreground">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
