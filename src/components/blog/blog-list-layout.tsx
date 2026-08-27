import Container from '@/components/layout/container';
import { BlogCategoryFilter } from '@/components/blog/blog-category-filter';
import type { BlogCategory } from '@/lib/blog';
import { getServerTranslations } from '@/lib/deskpet-i18n';
import type { ReactNode } from 'react';

type BlogListLayoutProps = {
  categoryList: BlogCategory[];
  children: ReactNode;
};

export function BlogListLayout({
  categoryList,
  children,
}: BlogListLayoutProps) {
  const t = getServerTranslations('BlogPage');

  return (
    <div className="mb-16">
      <div className="mt-8 flex w-full flex-col items-center justify-center gap-8">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <BlogCategoryFilter categoryList={categoryList} />
      </div>
      <Container className="mt-8 px-4">{children}</Container>
    </div>
  );
}
