import { websiteConfig } from '@/config/website';

/** Homepage pricing block and marketing nav/footer links to /pricing. */
export function isMarketingPricingEnabled(): boolean {
  const payment = websiteConfig.payment;
  return !!payment?.enable && payment.showMarketingPricing === true;
}
