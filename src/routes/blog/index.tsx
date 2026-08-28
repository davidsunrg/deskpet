import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogGridWithPagination } from '@/components/blog/blog-grid-with-pagination';
import { BlogListLayout } from '@/components/blog/blog-list-layout';
import { getCategories, getPaginatedPosts } from '@/lib/blog';
import { deskpetPageTitle } from '@/lib/deskpet-seo';
import { getDeskPetMessage } from '@/lib/deskpet-i18n';
import { getLocale, localeConfig } from '@/lib/locale';
import { getCanonicalUrlForLocale } from '@/lib/urls';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/blog/')({
  loader: () => ({
    ...getPaginatedPosts({ page: 1 }),
    categoryList: getCategories(),
  }),
  head: ({ loaderData }) => {
    const path = '/blog';
    const currentPage = loaderData?.currentPage ?? 1;
    const totalPages = loaderData?.totalPages ?? 1;
    const metadata = seo(path, {
      title: deskpetPageTitle(getDeskPetMessage('BlogPage.title')),
      description: getDeskPetMessage('BlogPage.description'),
    });
    const localizedUrl = (page?: number) => {
      const base = getCanonicalUrlForLocale(path, getLocale());
      return page && page > 1 ? `${base}/page/${page}` : base;
    };
    const canonicalHref = localizedUrl(currentPage);
    const paginationLinks: Array<{ rel: string; href: string }> = [
      { rel: 'canonical', href: canonicalHref },
    ];
    if (currentPage > 1) {
      paginationLinks.push({
        rel: 'prev',
        href: localizedUrl(currentPage - 1),
      });
    }
    if (currentPage < totalPages) {
      paginationLinks.push({
        rel: 'next',
        href: localizedUrl(currentPage + 1),
      });
    }
    const blogJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: getDeskPetMessage('BlogPage.title'),
      description: getDeskPetMessage('BlogPage.description'),
      url: canonicalHref,
      inLanguage: localeConfig[getLocale()].hreflang,
    };
    return {
      ...metadata,
      links: [
        ...paginationLinks,
        ...metadata.links.filter((link) => link.rel !== 'canonical'),
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(blogJsonLd),
        },
      ],
    };
  },
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { posts, totalPages, categoryList } = Route.useLoaderData();
  if (!websiteConfig.blog?.enable) {
    throw notFound();
  }

  return (
    <BlogListLayout categoryList={categoryList}>
      <BlogGridWithPagination
        posts={posts}
        totalPages={totalPages}
        routePrefix="/blog"
      />
    </BlogListLayout>
  );
}
