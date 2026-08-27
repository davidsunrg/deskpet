'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LocaleLink } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@/lib/blog';
import { useTranslations } from '@/lib/deskpet-i18n';
import { useParams } from '@tanstack/react-router';

type BlogCategoryListDesktopProps = {
  categoryList: BlogCategory[];
};

export function BlogCategoryListDesktop({
  categoryList,
}: BlogCategoryListDesktopProps) {
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug;
  const t = useTranslations('BlogPage');

  return (
    <div className="flex items-center justify-center">
      <ToggleGroup
        size="sm"
        type="single"
        value={slug || 'All'}
        aria-label="Toggle blog category"
        className="h-9 space-x-1 overflow-hidden rounded-md border bg-background p-1 *:h-7 *:text-muted-foreground"
      >
        <ToggleGroupItem
          value="All"
          className={cn(
            'rounded-sm px-2',
            'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
            'hover:bg-accent hover:text-accent-foreground'
          )}
          aria-label="Toggle all blog categories"
        >
          <LocaleLink href="/blog" className="px-4">
            <span>{t('all')}</span>
          </LocaleLink>
        </ToggleGroupItem>

        {categoryList.map((category) => (
          <ToggleGroupItem
            key={category.slug}
            value={category.slug}
            className={cn(
              'rounded-sm px-2',
              'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
              'hover:bg-accent hover:text-accent-foreground'
            )}
            aria-label={`Toggle blog category of ${category.name}`}
          >
            <LocaleLink
              href={`/blog/category/${category.slug}`}
              className="px-4"
            >
              <span>{category.name}</span>
            </LocaleLink>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
