import { createFileRoute } from '@tanstack/react-router';
import { getBaseUrl } from '@/lib/urls';
import { getCategories, getSortedPosts } from '@/lib/blog';
import { isMarketingPricingEnabled } from '@/lib/marketing-pricing';
import { websiteConfig } from '@/config/website';
import { petDetailRoute } from '@/lib/routes';
import {
  baseLocale,
  isLocalizedPath,
  localeConfig,
  locales,
  localizeHref,
} from '@/lib/locale';
import { listPetResources } from '@/utils/pets/pet-resources';

/**
 * Dynamic sitemap.xml
 * https://tanstack.dev/start/latest/docs/framework/react/guide/seo#dynamic-sitemap
 */
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const base = getBaseUrl().replace(/\/$/, '');
        const staticUrls: {
          path: string;
          changefreq?: string;
          priority?: string;
        }[] = [
          { path: '/', changefreq: 'daily', priority: '1.0' },
          { path: '/playground', changefreq: 'weekly' },
          { path: '/download', changefreq: 'monthly' },
          { path: '/tools/desktop-pet-maker', changefreq: 'monthly' },
          { path: '/tools/pet-video-maker', changefreq: 'monthly' },
          { path: '/pets', changefreq: 'weekly' },
          { path: '/p', changefreq: 'weekly' },
          { path: '/about', changefreq: 'monthly' },
          { path: '/contact', changefreq: 'monthly' },
          { path: '/health', changefreq: 'monthly' },
          { path: '/expense', changefreq: 'monthly' },
          { path: '/terms', changefreq: 'monthly' },
          { path: '/privacy', changefreq: 'monthly' },
          { path: '/cookie', changefreq: 'monthly' },
        ];

        if (websiteConfig.blog?.enable) {
          staticUrls.push({ path: '/blog', changefreq: 'weekly' });
        }
        if (isMarketingPricingEnabled()) {
          staticUrls.push({ path: '/pricing', changefreq: 'weekly' });
        }

        const alternates = (path: string) => {
          if (!isLocalizedPath(path)) {
            return '';
          }

          const localeLinks = locales
            .map((locale) => {
              const href = `${base}${localizeHref(path, { locale })}`;
              return `\n    <xhtml:link rel="alternate" hreflang="${localeConfig[locale].hreflang}" href="${href}" />`;
            })
            .join('');
          const defaultHref = `${base}${localizeHref(path, {
            locale: baseLocale,
          })}`;
          return `${localeLinks}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />`;
        };

        const urlEntry = (
          path: string,
          opts?: { changefreq?: string; priority?: string; lastmod?: string }
        ) => {
          const loc = isLocalizedPath(path)
            ? localizeHref(path, { locale: baseLocale })
            : path;
          const lastmod = opts?.lastmod
            ? `\n    <lastmod>${opts.lastmod}</lastmod>`
            : '';
          const changefreq = opts?.changefreq
            ? `\n    <changefreq>${opts.changefreq}</changefreq>`
            : '';
          const priority = opts?.priority
            ? `\n    <priority>${opts.priority}</priority>`
            : '';
          return `  <url>\n    <loc>${base}${loc}</loc>${alternates(path)}${lastmod}${changefreq}${priority}\n  </url>`;
        };

        const staticPart = staticUrls
          .map((u) =>
            urlEntry(u.path, { changefreq: u.changefreq, priority: u.priority })
          )
          .join('\n');

        const petDetailPart = listPetResources({ visibleIn: 'detail' })
          .map((resource) => urlEntry(petDetailRoute(resource.id)))
          .join('\n');

        let blogPart = '';
        if (websiteConfig.blog?.enable) {
          const posts = getSortedPosts(baseLocale);
          const pageSize = websiteConfig.blog.paginationSize ?? 6;
          const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
          const categories = getCategories(baseLocale);

          const blogListPages = Array.from({ length: totalPages }, (_, index) =>
            urlEntry(index === 0 ? '/blog' : `/blog/page/${index + 1}`, {
              changefreq: 'weekly',
            })
          );
          const categoryPages = categories.flatMap((category) => {
            const categoryPosts = posts.filter((post) =>
              post.categories.includes(category.slug)
            );
            const categoryTotalPages = Math.max(
              1,
              Math.ceil(categoryPosts.length / pageSize)
            );
            return Array.from({ length: categoryTotalPages }, (_, index) =>
              urlEntry(
                index === 0
                  ? `/blog/category/${category.slug}`
                  : `/blog/category/${category.slug}/page/${index + 1}`,
                { changefreq: 'weekly' }
              )
            );
          });
          const blogPosts = posts.map((p) =>
            urlEntry(`/blog/${p.slug}`, {
              changefreq: 'weekly',
              lastmod: new Date(p.date).toISOString().slice(0, 10),
            })
          );
          blogPart = [...blogListPages, ...categoryPages, ...blogPosts].join(
            '\n'
          );
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPart}
${petDetailPart ? `\n${petDetailPart}` : ''}
${blogPart ? `\n${blogPart}` : ''}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        });
      },
    },
  },
});
