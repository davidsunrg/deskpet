import { ExpensePage } from '@/components/pages/expense-page';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/expense')({
  head: () =>
    seo('/expense', {
      title: deskpetPageTitle(getDeskPetMessage('ExpensePage.title')),
      description: getDeskPetMessage('ExpensePage.description'),
    }),
  component: ExpensePage,
});
