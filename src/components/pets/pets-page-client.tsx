import {
  PetCardGrid,
  type PetCardSelectOrigin,
} from '@/components/pets/pet-card-grid';
import { SelectedCatPreview } from '@/components/pets/selected-cat-preview';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useLocaleRouter } from '@/lib/i18n/navigation';
import { Routes } from '@/lib/routes';
import type { ShowcasePet } from '@/utils/showcase-pets';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useState } from 'react';

type PetsPageClientProps = {
  pets: ShowcasePet[];
  page: number;
  totalPages: number;
};

export function PetsPageClient({
  pets,
  page,
  totalPages,
}: PetsPageClientProps) {
  const t = useTranslations('PetsPage');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [previewOrigin, setPreviewOrigin] =
    useState<PetCardSelectOrigin | null>(null);
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? null;

  const handleSelectPet = (petId: string, origin?: PetCardSelectOrigin) => {
    setSelectedPetId(petId);
    if (origin) setPreviewOrigin(origin);
  };

  const handleHidePet = () => {
    setSelectedPetId('');
    setPreviewOrigin(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10 pb-16">
      {selectedPet ? (
        <SelectedCatPreview
          pet={selectedPet}
          origin={previewOrigin}
          onHide={handleHidePet}
        />
      ) : null}
      <div className="space-y-4 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
          {t('intro')}
        </p>
      </div>

      <PetCardGrid
        pets={pets}
        selectedPetId={selectedPetId}
        onSelectPet={handleSelectPet}
        autoSelect="first"
        testId="pets-grid"
        cardTestIdPrefix="pets-pet"
        className="md:grid-cols-4 lg:grid-cols-4"
      />

      {totalPages > 1 ? (
        <PetsPagination page={page} totalPages={totalPages} />
      ) : null}
    </div>
  );
}

function PetsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useLocaleRouter();
  const pages = buildPageList(page, totalPages);

  const goToPage = (nextPage: number) => {
    if (nextPage <= 1) {
      router.push(Routes.Pets);
      return;
    }
    router.push(`${Routes.Pets}?page=${nextPage}`);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={page > 1 ? () => goToPage(page - 1) : undefined}
            aria-disabled={page <= 1}
            className={
              page <= 1
                ? 'pointer-events-none text-gray-300 dark:text-gray-600'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>

        {pages.map((entry, index) => (
          <PaginationItem key={`${entry}-${index}`}>
            {entry === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => goToPage(entry)}
                isActive={page === entry}
                className="cursor-pointer"
              >
                {entry}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={page < totalPages ? () => goToPage(page + 1) : undefined}
            aria-disabled={page >= totalPages}
            className={
              page >= totalPages
                ? 'pointer-events-none text-gray-300 dark:text-gray-600'
                : 'cursor-pointer'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(
  currentPage: number,
  totalPages: number
): Array<number | '...'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
}
