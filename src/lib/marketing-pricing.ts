import { websiteConfig } from '@/config/website';

/** Marketing pricing surfaces: homepage block, /pricing page, nav/footer links. */
export function isMarketingPricingEnabled(): boolean {
  const payment = websiteConfig.payment;
  return !!payment?.enable && payment.showMarketingPricing === true;
}
