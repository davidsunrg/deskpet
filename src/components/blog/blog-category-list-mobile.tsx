'use client';

import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { FilterItemMobile } from '@/components/shared/filter-item-mobile';
import type { BlogCategory } from '@/lib/blog';
import { useTranslations } from '@/lib/deskpet-i18n';
import { LayoutListIcon } from 'lucide-react';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';

type BlogCategoryListMobileProps = {
  categoryList: BlogCategory[];
};

export function BlogCategoryListMobile({
  categoryList,
}: BlogCategoryListMobileProps) {
  const params = useParams({ strict: false }) as { slug?: string };
  const slug = params.slug;
  const selectedCategory = categoryList.find(
    (category) => category.slug === slug
  );
  const [open, setOpen] = useState(false);
  const t = useTranslations('BlogPage');

  const closeDrawer = () => {
    setOpen(false);
  };

  return (
    <Drawer open={open} onClose={closeDrawer}>
      <DrawerTrigger
        onClick={() => setOpen(true)}
        className="flex w-full items-center border-y p-4 text-foreground/90"
      >
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LayoutListIcon className="size-5" />
            <span className="text-sm">{t('categories')}</span>
          </div>
          <span className="text-sm">
            {selectedCategory?.name ?? t('all')}
          </span>
        </div>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay className="fixed inset-0 z-40 bg-background/50" />
        <DrawerContent className="fixed inset-x-0 bottom-0 z-50 mt-24 overflow-hidden rounded-t-[10px] border bg-background">
          <DrawerTitle className="sr-only">{t('categories')}</DrawerTitle>
          <ul className="mb-14 w-full p-4 text-muted-foreground">
            <FilterItemMobile
              title={t('all')}
              href="/blog"
              active={!slug}
              clickAction={closeDrawer}
            />
            {categoryList.map((item) => (
              <FilterItemMobile
                key={item.slug}
                title={item.name}
                href={`/blog/category/${item.slug}`}
                active={item.slug === slug}
                clickAction={closeDrawer}
              />
            ))}
          </ul>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
