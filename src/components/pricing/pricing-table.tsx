import { LoginWrapper } from '@/components/auth/login-wrapper';
import { HeaderSection } from '@/components/layout/header-section';
import { CheckoutButton } from '@/components/pricing/create-checkout-button';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/auth/client';
import { LocaleLink, useLocalePathname } from '@/lib/i18n/navigation';
import { getMessageList } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { m } from '@/locale/paraglide/messages';
import type { PricePlan } from '@/payment/types';
import { IconLoader2 } from '@tabler/icons-react';
import { CheckIcon } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

export type ActionPricingPlanId = 'free' | 'customizeMyOwn';
export type PaidActionPricingPlanId = Exclude<ActionPricingPlanId, 'free'>;

export type PaidActionPlanSelection = {
  planId: PaidActionPricingPlanId;
  checkoutPlanId: string;
  priceId: string;
  actionCount: number;
};

interface PricingTableProps {
  metadata?: Record<string, string>;
  currentPlan?: PricePlan | null;
  className?: string;
  pageChrome?: boolean;
  planIds?: ReadonlyArray<ActionPricingPlanId>;
  onPaidPlanAction?: (
    selection: PaidActionPlanSelection
  ) => void | Promise<void>;
  paidActionBusy?: boolean;
}

function resolveActionCheckoutPrice(planId: PaidActionPricingPlanId): {
  checkoutPlanId: string;
  priceId: string;
} {
  const plan = websiteConfig.payment?.price?.plans[planId];
  return {
    checkoutPlanId: plan?.id ?? planId,
    priceId: plan?.prices[0]?.priceId ?? '',
  };
}

const customizeCheckout = resolveActionCheckoutPrice('customizeMyOwn');

const ACTION_PRICING_PLANS = [
  {
    id: 'free' as const,
    actionCount: 0,
    price: '$0',
    priceValue: 0,
    featured: false,
    href: Routes.Pets,
  },
  {
    id: 'customizeMyOwn' as const,
    actionCount: 0,
    price: '$79.99',
    priceValue: 79.99,
    featured: true,
    href: Routes.DesktopPetCreator,
    checkoutPlanId: customizeCheckout.checkoutPlanId,
    priceId: customizeCheckout.priceId,
  },
] as const;

const DEFAULT_MARKETING_PLAN_IDS: ReadonlyArray<ActionPricingPlanId> = [
  'free',
  'customizeMyOwn',
];

const planButtonClass = cn(
  'mt-0 min-h-[62px] w-full rounded-full border-[3px] border-deskpet-ink bg-white text-[17px] font-black text-deskpet-ink',
  'shadow-[5px_6px_0_0_rgba(57,44,56,0.18)] transition-[transform,box-shadow] duration-180',
  'hover:-translate-y-0.5 hover:bg-white hover:shadow-[5px_8px_0_0_rgba(57,44,56,0.18)]'
);

const featuredButtonClass = cn(
  planButtonClass,
  'bg-[#ffd361] hover:bg-[#ffe08a]'
);

export function PricingTable({
  className,
  metadata,
  pageChrome = true,
  planIds = DEFAULT_MARKETING_PLAN_IDS,
  onPaidPlanAction,
  paidActionBusy = false,
}: PricingTableProps) {
  const { data: session } = authClient.useSession();
  const currentPath = useLocalePathname();
  const [mounted, setMounted] = useState(false);
  const currentUser = session?.user;
  const plans = ACTION_PRICING_PLANS.filter((plan) =>
    planIds.includes(plan.id)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const gridCols =
    plans.length === 2
      ? 'w-full max-w-[980px] lg:grid-cols-2'
      : plans.length === 4
        ? 'max-w-[1600px] lg:grid-cols-4'
        : 'max-w-[1380px] lg:grid-cols-3';

  return (
    <div
      className={cn(
        pageChrome &&
          'bg-[#fffdfa] bg-[radial-gradient(#ded8d0_1.2px,transparent_1.2px)] [background-size:28px_28px]',
        className
      )}
    >
      {pageChrome ? (
        <header className="mx-auto max-w-[720px] px-4 pt-12 pb-8 text-center md:pt-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-deskpet-ink bg-[#e9fbf5] px-3 py-1.5 text-[13px] font-black uppercase tracking-[0.08em] text-[#078a69]">
            {m.pricing_page_eyebrow()}
          </div>
          <h1 className="m-0 whitespace-nowrap text-[clamp(28px,4vw,54px)] font-black leading-[1.02] tracking-[-0.045em] text-deskpet-ink">
            {m.pricing_page_subtitle()}
          </h1>
          <p className="mx-auto mt-3.5 m-0 max-w-[590px] text-lg leading-[1.6] text-deskpet-muted">
            {m.pricing_page_description()}
          </p>
        </header>
      ) : null}

      <section
        className={cn(pageChrome ? 'px-4 pt-2 pb-14' : 'px-4 pt-0 pb-0')}
        aria-label={m.pricing_page_plans_label()}
      >
        <div
          className={cn(
            'mx-auto grid grid-cols-1 items-stretch gap-[26px]',
            gridCols
          )}
        >
          {plans.map((plan) => {
            const features =
              plan.id === 'free'
                ? getMessageList(m.pricing_page_plans_free_features())
                : getMessageList(
                    m.pricing_page_plans_customize_my_own_features()
                  );
            const ctaLabel =
              plan.id === 'free'
                ? m.pricing_page_plans_free_cta()
                : m.pricing_page_plans_customize_my_own_cta();
            const buttonClass = plan.featured
              ? featuredButtonClass
              : planButtonClass;

            let button: ReactNode;
            if (plan.id === 'free') {
              button = (
                <Button
                  className={buttonClass}
                  render={<LocaleLink href={plan.href} />}
                >
                  {ctaLabel}
                </Button>
              );
            } else if (onPaidPlanAction && 'priceId' in plan) {
              button = (
                <Button
                  type="button"
                  className={buttonClass}
                  disabled={paidActionBusy}
                  onClick={() => {
                    void onPaidPlanAction({
                      planId: plan.id,
                      checkoutPlanId: plan.checkoutPlanId,
                      priceId: plan.priceId,
                      actionCount: plan.actionCount,
                    });
                  }}
                >
                  {paidActionBusy ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      {ctaLabel}
                    </>
                  ) : (
                    ctaLabel
                  )}
                </Button>
              );
            } else if ('priceId' in plan) {
              button =
                mounted && currentUser ? (
                  <CheckoutButton
                    planId={plan.checkoutPlanId}
                    priceId={plan.priceId}
                    metadata={metadata}
                    className={buttonClass}
                  >
                    {ctaLabel}
                  </CheckoutButton>
                ) : (
                  <LoginWrapper mode="modal" asChild callbackUrl={currentPath}>
                    <Button className={buttonClass}>{ctaLabel}</Button>
                  </LoginWrapper>
                );
            } else {
              button = (
                <Button className={buttonClass} disabled>
                  {ctaLabel}
                </Button>
              );
            }

            return (
              <StaticPlanCard
                key={plan.id}
                button={button}
                description={
                  plan.id === 'free'
                    ? m.pricing_page_plans_free_description()
                    : m.pricing_page_plans_customize_my_own_description()
                }
                featured={plan.featured}
                features={features}
                name={
                  plan.id === 'free'
                    ? m.pricing_page_plans_free_name()
                    : m.pricing_page_plans_customize_my_own_name()
                }
                note={
                  plan.id === 'free'
                    ? m.pricing_page_plans_free_note()
                    : m.pricing_page_plans_customize_my_own_note()
                }
                pill={
                  plan.id === 'free'
                    ? m.pricing_page_plans_free_pill()
                    : m.pricing_page_plans_customize_my_own_pill()
                }
                price={plan.price}
                type={
                  plan.id === 'free'
                    ? m.pricing_page_plans_free_type()
                    : m.pricing_page_plans_customize_my_own_type()
                }
                originalPrice={
                  plan.id === 'customizeMyOwn'
                    ? m.pricing_page_plans_customize_my_own_original_price()
                    : undefined
                }
                discountLabel={
                  plan.id === 'customizeMyOwn'
                    ? m.pricing_page_plans_customize_my_own_discount()
                    : undefined
                }
              />
            );
          })}
        </div>
      </section>

      {pageChrome ? <PricingFaq /> : null}
    </div>
  );
}

function PricingFaq() {
  const faqIds = ['free', 'paid', 'preset', 'cancel'] as const;

  return (
    <section id="faqs" className="px-4 pt-8 pb-16 md:pt-10 md:pb-20">
      <div className="mx-auto w-full max-w-7xl">
        <ScrollReveal>
          <HeaderSection
            title={m.pricing_page_faq_kicker()}
            subtitle={m.pricing_page_faq_title()}
            className="items-center gap-2 text-center"
            titleClassName="text-[13px] font-black tracking-[0.08em] text-[#078a69] dark:text-deskpet-mint"
            subtitleClassName="text-balance text-[clamp(34px,5vw,48px)] font-black leading-[1.05] tracking-[-0.045em] text-deskpet-ink dark:text-foreground"
          />
        </ScrollReveal>

        <ScrollReveal delay={150} className="mt-[22px]">
          <Accordion type="single" collapsible className="grid w-full gap-3">
            {faqIds.map((id) => (
              <AccordionItem
                key={id}
                value={id}
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
                  {id === 'free'
                    ? m.pricing_page_faq_free_question()
                    : id === 'paid'
                      ? m.pricing_page_faq_paid_question()
                      : id === 'preset'
                        ? m.pricing_page_faq_preset_question()
                        : m.pricing_page_faq_cancel_question()}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="px-5 pb-5 text-base font-medium leading-[1.65] text-deskpet-muted dark:text-muted-foreground">
                    {id === 'free'
                      ? m.pricing_page_faq_free_answer()
                      : id === 'paid'
                        ? m.pricing_page_faq_paid_answer()
                        : id === 'preset'
                          ? m.pricing_page_faq_preset_answer()
                          : m.pricing_page_faq_cancel_answer()}
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

function StaticPlanCard({
  badge,
  button,
  description,
  featured = false,
  features,
  name,
  note,
  pill,
  price,
  type,
  originalPrice,
  discountLabel,
}: {
  badge?: string;
  button: ReactNode;
  description: string;
  featured?: boolean;
  features: readonly string[];
  name: string;
  note: string;
  pill: string;
  price: string;
  type: string;
  originalPrice?: string;
  discountLabel?: string;
}) {
  return (
    <article
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-visible rounded-[28px] border-[3px] border-deskpet-ink bg-[#fbf7ef] px-[34px] pt-[34px] pb-[30px] text-deskpet-ink shadow-[10px_10px_0_0_#d9d7d1]',
        featured && 'bg-[#58d2ad] shadow-[10px_10px_0_0_#c8d9d2]'
      )}
    >
      {badge ? (
        <span className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[3px] border-deskpet-ink bg-[#ffd361] px-[22px] py-2.5 text-sm font-black text-deskpet-ink">
          {badge}
        </span>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-[168px] flex-col border-b-2 border-dashed border-[rgba(57,44,56,0.22)] pb-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <span
              className={cn(
                'text-[13px] font-black uppercase tracking-[0.1em] text-[#078a69]',
                featured && 'text-[#075d4c]'
              )}
            >
              {type}
            </span>
            <span className="shrink-0 rounded-full border-2 border-current px-[11px] py-[7px] text-xs leading-none font-black uppercase">
              {pill}
            </span>
          </div>

          <h2 className="m-0 mb-3 text-[clamp(40px,4vw,52px)] font-black leading-[0.95] tracking-[-0.055em]">
            {name}
          </h2>

          <p
            className={cn(
              'mt-auto m-0 min-h-[3.1em] max-w-[34ch] text-[17px] leading-[1.5] text-deskpet-muted',
              featured && 'text-[#23685b]'
            )}
          >
            {description}
          </p>
        </div>

        <div className="relative border-b-2 border-dashed border-[rgba(57,44,56,0.22)] py-7">
          <p className="m-0 text-[clamp(52px,4.5vw,64px)] leading-[0.95] font-black tracking-[-0.06em]">
            {price}
          </p>
          {originalPrice ? (
            <div className="absolute top-7 right-0 flex flex-col items-end gap-1">
              <span className="text-base font-extrabold text-[#23685b] line-through decoration-2">
                {originalPrice}
              </span>
              {discountLabel ? (
                <span className="rounded-full border-2 border-deskpet-ink bg-[#ffd361] px-2.5 py-1 text-[10px] leading-none font-black uppercase tracking-[0.04em] text-deskpet-ink">
                  {discountLabel}
                </span>
              ) : null}
            </div>
          ) : null}
          <p
            className={cn(
              'mt-2.5 m-0 min-h-5 text-sm font-extrabold text-[#6f5e6a]',
              featured && 'text-[#23685b]'
            )}
          >
            {note}
          </p>
        </div>

        <ul className="my-[30px] mb-[34px] grid list-none content-start gap-[18px] p-0">
          {features.map((feature) => (
            <li
              className="grid grid-cols-[28px_1fr] items-start gap-[13px] text-base font-extrabold leading-[1.35]"
              key={feature}
            >
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-[10px] border-2 border-[#078a69] bg-[#e9fbf5] text-[#078a69]',
                  featured && 'border-[#075d4c] bg-[#dff9ef] text-[#075d4c]'
                )}
              >
                <CheckIcon className="size-3.5" aria-hidden />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">{button}</div>
      </div>
    </article>
  );
}
