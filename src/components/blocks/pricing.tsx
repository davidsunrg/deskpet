import { PricingTable } from '@/components/pricing/pricing-table';

/**
 * Home pricing block — same plans as `/pricing` without page chrome.
 */
export default function PricingSection() {
  return (
    <section id="pricing">
      <PricingTable pageChrome={false} />
    </section>
  );
}
