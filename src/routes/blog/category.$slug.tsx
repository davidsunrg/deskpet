import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogGridWithPagination } from '@/components/blog/blog-grid-with-pagination';
import { BlogListLayout } from '@/components/blog/blog-list-layout';
import {
  getCategories,
  getCategoryBySlug,
  getPaginatedPosts,
} from '@/lib/blog';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { getLocale } from '@/lib/locale';
import { getCanonicalUrlForLocale } from '@/lib/urls';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/blog/category/$slug')({
  loader: ({ params }) => {
    const category = getCategoryBySlug(params.slug);
    if (!category) {
      throw notFound();
    }
    return {
      category,
      ...getPaginatedPosts({ page: 1, categorySlug: params.slug }),
      categoryList: getCategories(),
    };
  },
  head: ({ loaderData, params }) => {
    const category = loaderData?.category;
    if (!category) {
      return {};
    }
    const path = `/blog/category/${params.slug}`;
    const metadata = seo(path, {
      title: deskpetPageTitle(`${category.name} | ${getDeskPetMessage('BlogPage.title')}`),
      description: category.description || getDeskPetMessage('BlogPage.description'),
    });
    const canonicalHref = getCanonicalUrlForLocale(path, getLocale());
    return {
      ...metadata,
      links: [{ rel: 'canonical', href: canonicalHref }, ...metadata.links.filter((link) => link.rel !== 'canonical')],
    };
  },
  component: BlogCategoryPage,
});

function BlogCategoryPage() {
  const { posts, totalPages, categoryList, category } = Route.useLoaderData();
  if (!websiteConfig.blog?.enable) {
    throw notFound();
  }

  return (
    <BlogListLayout categoryList={categoryList}>
      <BlogGridWithPagination
        posts={posts}
        totalPages={totalPages}
        routePrefix={`/blog/category/${category.slug}`}
      />
    </BlogListLayout>
  );
}
