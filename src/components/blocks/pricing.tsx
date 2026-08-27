import { PricingTable } from '@/components/pricing/pricing-table';

/**
 * Home pricing block — same chrome, title, and plans as `/pricing`.
 */
export default function PricingSection() {
  return (
    <section id="pricing">
      <PricingTable />
    </section>
  );
}
