import Container from '@/components/layout/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ContactFormCard } from '@/components/contact/contact-form-card';
import { websiteConfig } from '@/config/website';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { seo } from '@/lib/seo';
import { MailIcon } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(pages)/about')({
  head: () =>
    seo('/about', {
      title: deskpetPageTitle(getDeskPetMessage('AboutPage.title')),
      description: getDeskPetMessage('AboutPage.description'),
    }),
  component: AboutPage,
});

function AboutPage() {
  const supportEmail = websiteConfig.mail?.supportEmail;

  return (
    <Container className="py-16 px-4">
      <div className="mx-auto mb-24 mt-8 max-w-5xl md:mt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(20rem,1.15fr)_1fr] lg:gap-14">
          <div className="flex min-w-0 items-center gap-6 sm:gap-8">
            <Avatar className="size-32 shrink-0 p-0.5">
              <AvatarImage
                className="rounded-full border-4 border-gray-200"
                src="/logo.png"
                alt="Avatar"
              />
              <AvatarFallback>
                <div className="size-32 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-4xl text-foreground">
                {getDeskPetMessage('AboutPage.authorName')}
              </h1>
              <p className="mt-2 whitespace-nowrap text-base text-muted-foreground">
                {getDeskPetMessage('AboutPage.authorBio')}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-8 text-base text-muted-foreground">
              {getDeskPetMessage('AboutPage.introduction')}
            </p>

            {supportEmail ? (
              <Button asChild>
                <a href={`mailto:${supportEmail}`}>
                  <MailIcon className="mr-1 size-4" />
                  {getDeskPetMessage('AboutPage.talkWithMe')}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Container>
  );
}
