import { createFileRoute, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { AllPostsButton } from '@/components/blog/all-posts-button';
import { BlogGrid } from '@/components/blog/blog-grid';
import { BlogImage } from '@/components/blog/blog-image';
import { Markdown } from '@/components/markdown/markdown';
import {
  getCategoriesForPost,
  getPostBySlug,
  getRelatedPosts,
} from '@/lib/blog';
import { getServerTranslations } from '@/lib/deskpet-i18n';
import { renderMarkdown } from '@/lib/markdown';
import { websiteConfig } from '@/config/website';
import { getCanonicalUrl, getImageUrl } from '@/lib/urls';
import { getLocale, localeConfig } from '@/lib/locale';
import { seo } from '@/lib/seo';
import { LocaleLink } from '@/lib/i18n/navigation';
import { formatDate } from '@/lib/formatter';
import { CalendarIcon, FileTextIcon } from 'lucide-react';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    if (params.slug === 'page' || params.slug === 'category') {
      throw notFound();
    }
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    const markdown = await renderMarkdown(post.content);
    const blogCategories = getCategoriesForPost(post);
    const relatedPosts = getRelatedPosts(post);
    return { ...post, markdown, blogCategories, relatedPosts };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData;
    if (!post) return {};
    const path = `/blog/${params.slug}`;
    const title = `${post.title} | ${websiteConfig.metadata?.name}`;
    const description =
      post.description ?? websiteConfig.metadata?.description ?? '';
    const image = post.image ? getImageUrl(post.image) : undefined;
    const canonicalUrl = getCanonicalUrl(path);
    const metadata = seo(path, {
      title,
      description,
      image,
      type: 'article',
    });
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      inLanguage: localeConfig[getLocale()].hreflang,
      ...(image && { image }),
      datePublished: new Date(post.date).toISOString(),
      dateModified: new Date(post.date).toISOString(),
      url: canonicalUrl,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      author: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? '',
      },
      publisher: {
        '@type': 'Organization',
        name: websiteConfig.metadata?.name ?? '',
        logo: {
          '@type': 'ImageObject',
          url: getImageUrl(
            websiteConfig.metadata?.images?.logoLight ?? '/logo.png'
          ),
        },
      },
    };
    return {
      ...metadata,
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(articleJsonLd),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const t = getServerTranslations('BlogPage');
  if (!post || !websiteConfig.blog?.enable) throw notFound();

  const publishDate = formatDate(new Date(post.date));

  return (
    <Container className="px-4 py-8">
      <div className="mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col lg:col-span-2">
            <div className="space-y-8">
              <div className="group relative aspect-video overflow-hidden rounded-lg border transition-all">
                <BlogImage
                  src={post.image}
                  alt={post.title}
                  title={post.title}
                />
              </div>

              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <time
                  className="text-sm leading-none text-muted-foreground"
                  dateTime={post.date}
                >
                  {publishDate}
                </time>
              </div>

              <h1 className="text-3xl font-bold">{post.title}</h1>
              {post.description ? (
                <p className="text-lg text-muted-foreground">
                  {post.description}
                </p>
              ) : null}
            </div>

            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
              <Markdown markup={post.markdown.markup} />
            </div>

            <div className="my-16 flex items-center justify-start">
              <AllPostsButton />
            </div>
          </div>

          <div>
            <div className="space-y-4 lg:sticky lg:top-24">
              {post.blogCategories.length > 0 ? (
                <div className="rounded-lg bg-muted/50 p-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    {t('categories')}
                  </h2>
                  <ul className="flex flex-wrap gap-4">
                    {post.blogCategories.map((category) => (
                      <li key={category.slug}>
                        <LocaleLink
                          href={`/blog/category/${category.slug}`}
                          className="text-sm font-medium text-muted-foreground hover:text-primary"
                        >
                          {category.name}
                        </LocaleLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {post.relatedPosts.length > 0 ? (
          <div className="mt-8 flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-wider text-primary">
                {t('morePosts')}
              </h2>
            </div>
            <BlogGrid posts={post.relatedPosts} />
          </div>
        ) : null}
      </div>
    </Container>
  );
}
