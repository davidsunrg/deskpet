import Container from '@/components/layout/container';
import { BlogCategoryListDesktop } from '@/components/blog/blog-category-list-desktop';
import { BlogCategoryListMobile } from '@/components/blog/blog-category-list-mobile';
import type { BlogCategory } from '@/lib/blog';

type BlogCategoryFilterProps = {
  categoryList: BlogCategory[];
};

export function BlogCategoryFilter({ categoryList }: BlogCategoryFilterProps) {
  return (
    <section className="w-full">
      <Container className="hidden md:block">
        <BlogCategoryListDesktop categoryList={categoryList} />
      </Container>
      <div className="block w-full md:hidden">
        <BlogCategoryListMobile categoryList={categoryList} />
      </div>
    </section>
  );
}
