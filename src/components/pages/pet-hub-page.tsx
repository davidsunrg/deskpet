import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LocaleLink } from '@/lib/i18n/navigation';
import { petDetailRoute } from '@/lib/routes';
import type { PetResourceManifest } from '@/utils/pets/pet-resource-types';
import { isPetResourceVisible } from '@/utils/pets/pet-resources';

type PetHubPageProps = {
  resources: PetResourceManifest[];
};

export function PetHubPage({ resources }: PetHubPageProps) {
  return (
    <Container className="px-4 py-16 md:py-20">
      <header className="max-w-3xl">
        <Badge
          variant="outline"
          className="h-auto rounded-full border-2 bg-deskpet-mint/15 px-3 py-1.5 font-black"
        >
          Pet Hub
        </Badge>
        <h1 className="mt-5 text-5xl font-black tracking-[-0.055em] text-deskpet-ink dark:text-foreground md:text-7xl">
          Meet every DeskPet companion
        </h1>
        <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground md:text-lg">
          Browse catalog favorites and special pet guides. Choose a companion to
          explore its personality, animations, and frequently asked questions.
        </p>
      </header>

      <div
        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="pet-hub-grid"
      >
        {resources.map((resource) => {
          const isCatalogPet = isPetResourceVisible(resource, 'catalog');

          return (
            <LocaleLink
              key={resource.id}
              href={petDetailRoute(resource.id)}
              className="group block"
            >
              <Card className="h-full rounded-[24px] border-2 border-deskpet-ink bg-deskpet-paper py-0 shadow-[5px_6px_0_0_rgba(55,39,51,0.12)] transition-transform group-hover:-translate-y-1 dark:border-border dark:bg-card dark:shadow-[5px_6px_0_0_rgba(0,0,0,0.35)]">
                <CardHeader className="gap-4 px-6 pt-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="h-auto rounded-full bg-white px-3 py-1 font-black capitalize dark:bg-background"
                    >
                      {resource.species}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-auto rounded-full px-3 py-1 font-black"
                    >
                      {isCatalogPet ? 'Catalog pet' : 'Special guide'}
                    </Badge>
                  </div>
                  <h2 className="text-3xl font-black tracking-[-0.035em] text-deskpet-ink dark:text-foreground">
                    {resource.name}
                  </h2>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-6 px-6 pb-6">
                  <p className="font-medium leading-6 text-muted-foreground">
                    {resource.detail?.description ??
                      `Meet ${resource.name}, explore its DeskPet personality, and preview what this companion can do.`}
                  </p>
                  <span className="font-black text-deskpet-ink group-hover:text-deskpet-mint dark:text-foreground">
                    View pet profile →
                  </span>
                </CardContent>
              </Card>
            </LocaleLink>
          );
        })}
      </div>
    </Container>
  );
}
