import { createFileRoute } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { ContactFormCard } from '@/components/contact/contact-form-card';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/(pages)/contact')({
  head: () =>
    seo('/contact', {
      title: deskpetPageTitle(getDeskPetMessage('ContactPage.title')),
      description: getDeskPetMessage('ContactPage.description'),
    }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8 pb-16">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {getDeskPetMessage('ContactPage.title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {getDeskPetMessage('ContactPage.subtitle')}
          </p>
        </div>
        <ContactFormCard />
      </div>
    </Container>
  );
}
