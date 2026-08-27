'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BehaviorsGrid } from '@/components/blocks/behaviors/behaviors';
import {
  PetCardGrid,
  type PetCardSelectOrigin,
} from '@/components/pets/pet-card-grid';
import { SelectedCatPreview } from '@/components/pets/selected-cat-preview';
import { LocaleLink } from '@/lib/i18n/navigation';
import { Routes, playgroundRoute } from '@/lib/routes';
import {
  getCatalogPetDetailCopy,
  type CatalogPetDetailCopy,
} from '@/utils/catalog-pet-detail-copy';
import type { PetResourceFaq } from '@/utils/pets/pet-resource-types';
import type { PetDetail } from '@/utils/pets/showcase-pet-to-detail';
import type { ShowcasePet } from '@/utils/showcase-pets';
import { cn } from '@/utils/cn';
import { ImageIcon, PlayIcon, SparklesIcon, VideoIcon } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export type { PetDetail } from '@/utils/pets/showcase-pet-to-detail';

export type PetDetailTemplateProps = {
  pet: PetDetail;
  /** Catalog pet used by the floating play preview. */
  playPet: ShowcasePet | null;
  relatedPets: ShowcasePet[];
  /** Per-breed About / stats / personality (public catalog pages). */
  detailCopy?: CatalogPetDetailCopy;
  /** Pet-specific FAQ items; omitted or empty hides the FAQ section. */
  faqs?: readonly PetResourceFaq[];
  backHref?: string;
  backLabel?: string;
  /** Override the hero badge when the detail page is not a catalog record. */
  heroBadgeLabel?: string;
  /** Override the About-section availability value. */
  availabilityText?: string;
};

const stageActions = [
  { label: 'Play animation', icon: '▶' },
  { label: 'Feed pet', icon: '🍪' },
  { label: 'Pet companion', icon: '✋' },
] as const;

const mediaItems = [
  {
    title: 'Relaxing by the Window',
    description: 'Image preview',
    type: 'image',
  },
  {
    title: 'Cursor Chase',
    description: '8-second animation',
    type: 'video',
  },
  {
    title: 'Box Time',
    description: 'Image preview',
    type: 'image',
  },
] as const;

function petInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

function sentenceCase(value: string | null) {
  if (!value) return null;
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function DetailSection({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6 md:py-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-deskpet-mint">
            {kicker}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-deskpet-ink dark:text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-xl text-sm font-medium leading-6 text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function BrutalCard({
  className,
  children,
  testId,
}: {
  className?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <Card
      className={cn(
        'rounded-[26px] border-2 border-deskpet-ink bg-deskpet-paper shadow-[6px_7px_0_0_rgba(55,39,51,0.14)] ring-0 dark:border-border dark:bg-card dark:shadow-[6px_7px_0_0_rgba(0,0,0,0.35)]',
        className
      )}
      data-testid={testId}
    >
      {children}
    </Card>
  );
}

export function PetDetailTemplate({
  pet,
  playPet: initialPlayPet,
  relatedPets,
  detailCopy,
  faqs,
  backHref = Routes.Pets,
  backLabel = 'Pets',
  heroBadgeLabel,
  availabilityText,
}: PetDetailTemplateProps) {
  const copy = detailCopy ?? getCatalogPetDetailCopy(pet.id);
  const previewUrl = pet.avatarUrl;
  const description =
    pet.description ??
    `${pet.name} is a desktop companion for quiet work sessions, playful breaks, and browser-based pet experiments.`;
  const category = sentenceCase(pet.category) ?? 'Cat';
  const subcategory = sentenceCase(pet.subcategory);
  const playablePets = useMemo(() => {
    const map = new Map<string, ShowcasePet>();
    if (initialPlayPet) map.set(initialPlayPet.id, initialPlayPet);
    for (const related of relatedPets) {
      map.set(related.id, related);
    }
    return map;
  }, [initialPlayPet, relatedPets]);

  const [playPetId, setPlayPetId] = useState(initialPlayPet?.id ?? pet.id);
  const [previewHidden, setPreviewHidden] = useState(false);
  const [previewOrigin, setPreviewOrigin] =
    useState<PetCardSelectOrigin | null>(null);
  const [heroOrigin, setHeroOrigin] = useState<PetCardSelectOrigin | null>(
    null
  );
  const heroStageRef = useRef<HTMLDivElement>(null);

  const activePlayPet = playablePets.get(playPetId) ?? initialPlayPet;
  const showInteractive = Boolean(activePlayPet) && !previewHidden;
  const placementOrigin = previewOrigin ?? heroOrigin;

  useLayoutEffect(() => {
    const stage = heroStageRef.current;
    if (!stage) return;

    const measure = () => {
      const rect = stage.getBoundingClientRect();
      setHeroOrigin({
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleSelectPet = (petId: string, origin?: PetCardSelectOrigin) => {
    setPlayPetId(petId);
    setPreviewHidden(false);
    if (origin) setPreviewOrigin(origin);
    else setPreviewOrigin(null);
  };

  const resumePlay = () => {
    if (!activePlayPet && initialPlayPet) {
      setPlayPetId(initialPlayPet.id);
    }
    setPreviewHidden(false);
    // Fall back to the hero-stage center for this page's pet.
    setPreviewOrigin(null);
  };

  return (
    <div className="space-y-2" data-testid="pet-detail-page">
      {showInteractive && activePlayPet && placementOrigin ? (
        <SelectedCatPreview
          pet={activePlayPet}
          origin={placementOrigin}
          onHide={() => {
            setPreviewHidden(true);
            setPreviewOrigin(null);
          }}
        />
      ) : null}

      <div className="text-sm font-semibold text-muted-foreground">
        <LocaleLink
          href={backHref as typeof Routes.Pets}
          className="hover:text-foreground"
        >
          {backLabel}
        </LocaleLink>
        <span className="mx-2">/</span>
        <span>{pet.name}</span>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div
          ref={heroStageRef}
          className={cn(
            'relative grid min-h-[360px] place-items-center overflow-hidden rounded-[34px] border-2 border-deskpet-ink',
            'bg-[radial-gradient(circle_at_50%_42%,rgba(85,217,170,0.25),transparent_34%),linear-gradient(180deg,#fff3cd_0%,#fffaf0_100%)]',
            'shadow-[10px_12px_0_0_rgba(55,39,51,0.14)] dark:border-border dark:shadow-[10px_12px_0_0_rgba(0,0,0,0.35)]',
            'md:min-h-[500px]'
          )}
          data-testid="pet-detail-hero-stage"
        >
          <Badge
            variant="secondary"
            className="absolute left-5 top-5 z-10 h-auto rounded-full border-2 px-3 py-1.5 text-sm font-black"
          >
            {heroBadgeLabel ??
              (pet.isDefault
                ? 'Default Pet'
                : pet.isBuiltin
                  ? 'Catalog Pet'
                  : 'Your Pet')}
          </Badge>

          <button
            type="button"
            className="relative z-10 flex w-full max-w-sm flex-col items-center"
            onClick={() => {
              if (!showInteractive) resumePlay();
            }}
            aria-label={
              showInteractive
                ? `${activePlayPet?.breedLabel ?? pet.name} is playing`
                : `Play ${pet.name}`
            }
          >
            {showInteractive ? (
              <span
                className="block h-64 w-full max-w-sm rounded-[24px] bg-[#f7f1e0]/80 md:h-80"
                aria-hidden="true"
              />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={pet.name}
                className="max-h-72 w-full max-w-sm rounded-md object-contain drop-shadow-[0_18px_0_rgba(55,39,51,0.08)] md:max-h-96"
              />
            ) : (
              <Avatar className="size-44 rounded-md border-2 border-deskpet-ink bg-white text-5xl shadow-[7px_8px_0_0_rgba(55,39,51,0.12)] after:rounded-md md:size-56">
                <AvatarImage
                  src={pet.avatarUrl ?? undefined}
                  alt={pet.name}
                  className="rounded-md"
                />
                <AvatarFallback className="rounded-md">
                  {petInitials(pet.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="mt-2 h-7 w-44 rounded-full bg-deskpet-ink/15 blur-[2px]" />
          </button>

          <div className="absolute bottom-[22px] left-6 right-6 z-10 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2.5">
              {stageActions.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled={label !== 'Play animation'}
                  onClick={() => {
                    if (label === 'Play animation') resumePlay();
                  }}
                  className={cn(
                    'grid size-[46px] place-items-center rounded-[14px] border-2 border-deskpet-ink',
                    'bg-white text-[19px] leading-none shadow-[3px_4px_0_0_rgba(56,42,53,0.14)]',
                    'disabled:pointer-events-none disabled:opacity-100 dark:border-border'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
            <Button
              variant="brutalOutline"
              asChild
              className="h-12 min-h-12 rounded-full border-2 border-deskpet-ink bg-white px-[18px] text-sm font-black shadow-[3px_4px_0_0_rgba(56,42,53,0.1)] hover:bg-white hover:shadow-[3px_4px_0_0_rgba(56,42,53,0.1)]"
            >
              <LocaleLink href={playgroundRoute(initialPlayPet?.id ?? pet.id)}>
                Open Playground
              </LocaleLink>
            </Button>
          </div>
        </div>

        <BrutalCard className="bg-[#FFF9EE]">
          <CardHeader className="gap-4 px-7 pt-8">
            <Badge
              variant="outline"
              className="h-auto w-fit rounded-full bg-white px-3 py-1.5 text-sm font-black"
            >
              {category}{' '}
              {subcategory ? `· ${subcategory}` : '· Desktop companion'}
            </Badge>
            <div>
              <h1 className="text-5xl font-black leading-none tracking-[-0.055em] text-deskpet-ink dark:text-foreground md:text-6xl">
                {pet.name}
              </h1>
              <p className="mt-5 text-base font-medium leading-7 text-muted-foreground md:text-lg">
                {description}
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col px-7 pb-8">
            <div className="mb-7 flex flex-wrap gap-2">
              {copy.traits.map((trait) => (
                <Badge
                  key={trait}
                  variant="outline"
                  className="h-auto rounded-full border-2 bg-white px-3 py-1.5 font-black"
                >
                  {trait}
                </Badge>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['28', 'Available actions'],
                [
                  pet.spritesheetUrl ? 'Atlas' : 'Browser',
                  'Play instantly online',
                ],
                [pet.zipFilePath ? 'Desktop' : 'Ready', 'Windows and macOS'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[18px] border-2 border-deskpet-ink/15 bg-white p-4"
                >
                  <strong className="block text-lg">{value}</strong>
                  <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-3">
              <Button
                variant="brutalSecondary"
                size="xl"
                className="w-full"
                asChild
              >
                <LocaleLink
                  href={playgroundRoute(initialPlayPet?.id ?? pet.id)}
                >
                  <PlayIcon className="size-4" />
                  Open Playground
                </LocaleLink>
              </Button>
            </div>
          </CardContent>
        </BrutalCard>
      </section>

      <DetailSection
        kicker="Meet your companion"
        title={`About ${pet.name}`}
        description="Part profile, part media album, and part interactive desktop companion."
      >
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <BrutalCard className="bg-[#FFF9EE]">
            <CardContent className="space-y-5 px-7 py-7 text-base font-medium leading-8 text-muted-foreground">
              {copy.about.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </CardContent>
          </BrutalCard>

          <BrutalCard className="bg-white">
            <CardContent className="grid gap-3 px-6 py-6 sm:grid-cols-2">
              {[
                [
                  'Source',
                  pet.catalogSource ??
                    (pet.isBuiltin ? 'Catalog' : 'Workspace'),
                ],
                ['Temperament', copy.stats.temperament],
                ['Activity', copy.stats.activity],
                ['Best for', copy.stats.bestFor],
                ['Desktop size', copy.stats.desktopSize],
                [
                  'Availability',
                  availabilityText ??
                    (pet.isBuiltin ? 'Free catalog' : 'Private'),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border-2 border-deskpet-ink/15 bg-deskpet-paper p-4"
                >
                  <span className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  <strong className="mt-1 block">{value}</strong>
                </div>
              ))}
            </CardContent>
          </BrutalCard>
        </div>
      </DetailSection>

      <DetailSection kicker="Personality" title={`What ${pet.name} Is Like`}>
        <BrutalCard className="bg-white" testId="pet-detail-personality">
          <CardContent className="grid gap-5 px-6 py-6">
            {copy.personality.map((item) => (
              <div
                key={item.name}
                className="grid grid-cols-[96px_1fr_42px] items-center gap-3 md:grid-cols-[120px_1fr_48px]"
              >
                <span className="font-bold">{item.name}</span>
                <div className="h-3.5 overflow-hidden rounded-full border-2 border-deskpet-ink bg-deskpet-paper">
                  <div
                    className="h-full rounded-full bg-[repeating-linear-gradient(-45deg,#55d9aa,#55d9aa_10px,#79e5bf_10px,#79e5bf_20px)]"
                    style={{ width: `${item.score * 10}%` }}
                  />
                </div>
                <span className="text-right text-xs font-black text-muted-foreground">
                  {item.score}/10
                </span>
              </div>
            ))}
          </CardContent>
        </BrutalCard>
      </DetailSection>

      {faqs && faqs.length > 0 ? (
        <DetailSection
          kicker="Questions"
          title={`${pet.name} FAQs`}
          description={`Common questions about ${pet.name} as a DeskPet companion.`}
        >
          <Accordion
            type="single"
            collapsible
            className="grid w-full gap-3"
            data-testid="pet-detail-faqs"
          >
            {faqs.map((item, index) => (
              <AccordionItem
                key={`${item.question}-${index}`}
                value={`faq-${index}`}
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
        </DetailSection>
      ) : null}

      <DetailSection
        kicker="Behaviors"
        title="What your pet can do in DeskPet.ai"
        description="Every action is designed to make the pet feel alive without becoming distracting."
      >
        <BehaviorsGrid testId="pet-detail-behaviors" />
      </DetailSection>

      <DetailSection
        kicker="AI playground"
        title={`Create with ${pet.name}`}
        description="Generate new images and videos while keeping the same pet character."
      >
        <BrutalCard className="bg-[linear-gradient(135deg,#fff9ee_0%,#f7f1ff_100%)]">
          <CardContent className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-3">
              {[
                [
                  'AI Image',
                  `Place ${pet.name} in any scene or outfit.`,
                  ImageIcon,
                ],
                [
                  'AI Video',
                  'Create short clips with custom actions.',
                  VideoIcon,
                ],
                [
                  'New Animation',
                  'Add another action to your pet.',
                  SparklesIcon,
                ],
              ].map(([title, copy, Icon]) => (
                <div
                  key={String(title)}
                  className="flex flex-col gap-3 rounded-[20px] border-2 border-deskpet-ink bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <strong className="block">{title as string}</strong>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {copy as string}
                    </span>
                  </div>
                  <Button variant="brutalOutline" disabled>
                    <Icon className="size-4" />
                    Create
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid min-h-64 place-items-center rounded-[24px] border-2 border-dashed border-deskpet-ink/30 bg-white/60 text-center">
              <div>
                <SparklesIcon className="mx-auto size-14 text-deskpet-mint" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Example: {pet.name} exploring space
                </p>
              </div>
            </div>
          </CardContent>
        </BrutalCard>
      </DetailSection>

      <DetailSection kicker="Media" title="Photos & Videos">
        <div
          className="grid gap-4 md:grid-cols-3"
          data-testid="pet-detail-media"
        >
          {mediaItems.map((item) => (
            <BrutalCard key={item.title} className="bg-white">
              <div className="relative grid aspect-[4/3] place-items-center bg-deskpet-sun/30">
                {item.type === 'video' ? (
                  <div className="grid size-14 place-items-center rounded-full border-2 border-deskpet-ink bg-white shadow-[3px_4px_0_0_rgba(55,39,51,0.14)]">
                    <PlayIcon className="size-5 fill-current" />
                  </div>
                ) : (
                  <ImageIcon className="size-14 text-deskpet-ink/70" />
                )}
              </div>
              <CardContent className="px-5 py-4">
                <strong className="block">{item.title}</strong>
                <span className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </span>
              </CardContent>
            </BrutalCard>
          ))}
        </div>
      </DetailSection>

      <DetailSection kicker="More companions" title="You May Also Like">
        <PetCardGrid
          pets={relatedPets}
          selectedPetId={showInteractive ? playPetId : undefined}
          onSelectPet={handleSelectPet}
          className="mx-0 max-w-none justify-items-stretch lg:grid-cols-4"
          testId="pet-detail-related-pets"
          cardTestIdPrefix="pet-detail-related-pet"
        />
      </DetailSection>
    </div>
  );
}
