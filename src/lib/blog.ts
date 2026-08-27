import { allBlogs, allCategories } from 'content-collections';
import type { Blog, Category } from 'content-collections';
import { websiteConfig } from '@/config/website';
import { baseLocale, getLocale, type Locale } from '@/lib/locale';

export type BlogPost = Blog & { locale: Locale; slug: string };

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

const DEFAULT_PAGE_SIZE = 6;

function getPageSize(): number {
  return websiteConfig.blog?.paginationSize ?? DEFAULT_PAGE_SIZE;
}

export function getCategories(locale: Locale = getLocale()): BlogCategory[] {
  return (allCategories as (Category & { locale: Locale; slug: string })[])
    .filter((category) => category.locale === locale)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description ?? '',
    }));
}

export function getCategoryBySlug(
  slug: string,
  locale: Locale = getLocale()
): BlogCategory | undefined {
  return getCategories(locale).find((category) => category.slug === slug);
}

export function getCategoriesForPost(
  post: BlogPost,
  locale: Locale = getLocale()
): BlogCategory[] {
  const categories = getCategories(locale);
  return categories.filter((category) =>
    post.categories.includes(category.slug)
  );
}

export function getSortedPosts(
  locale: Locale = getLocale(),
  categorySlug?: string
): BlogPost[] {
  return [...(allBlogs as BlogPost[])]
    .filter((post) => post.locale === locale)
    .filter((post) =>
      categorySlug ? post.categories.includes(categorySlug) : true
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(
  slug: string,
  locale: Locale = getLocale()
): BlogPost | undefined {
  const posts = allBlogs as BlogPost[];
  return (
    posts.find((post) => post.slug === slug && post.locale === locale) ??
    posts.find((post) => post.slug === slug && post.locale === baseLocale)
  );
}

export function getRelatedPosts(
  post: BlogPost,
  locale: Locale = getLocale()
): BlogPost[] {
  const relatedPostsSize = websiteConfig.blog?.relatedPostsSize ?? 3;
  return getSortedPosts(locale)
    .filter((candidate) => candidate.slug !== post.slug)
    .sort(() => Math.random() - 0.5)
    .slice(0, relatedPostsSize);
}

export function getPaginatedPosts(options: {
  page?: number;
  categorySlug?: string;
  locale?: Locale;
} = {}): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
} {
  const pageSize = getPageSize();
  const locale = options.locale ?? getLocale();
  const sorted = getSortedPosts(locale, options.categorySlug);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.max(1, Math.min(options.page ?? 1, totalPages));
  const start = (currentPage - 1) * pageSize;
  return {
    posts: sorted.slice(start, start + pageSize),
    totalPages,
    currentPage,
  };
}
