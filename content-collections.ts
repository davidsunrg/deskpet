import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';

function getLocaleSlug(path: string) {
  const localeMatch = path.match(/^(?<slug>.+)\.en$/);
  if (localeMatch?.groups) {
    return {
      locale: 'en' as const,
      slug: localeMatch.groups.slug,
    };
  }
  return { locale: 'en' as const, slug: path };
}

const category = defineCollection({
  name: 'category',
  directory: 'content/category',
  include: '**/*.md',
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    content: z.string().optional(),
  }),
  transform: (doc) => {
    const { locale, slug } = getLocaleSlug(
      (doc as { _meta: { path: string } })._meta.path
    );
    return { ...doc, locale, slug };
  },
});

const blog = defineCollection({
  name: 'blog',
  directory: 'content/blog',
  include: '**/*.md',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    categories: z.array(z.string()),
    content: z.string(),
    image: z.string().min(1),
  }),
  transform: (doc) => {
    const { locale, slug } = getLocaleSlug(
      (doc as { _meta: { path: string } })._meta.path
    );
    return { ...doc, locale, slug };
  },
});

const pages = defineCollection({
  name: 'pages',
  directory: 'content/pages',
  include: '**/*.md',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().optional(),
    content: z.string(),
  }),
  transform: (doc) => {
    const { locale, slug } = getLocaleSlug(
      (doc as { _meta: { path: string } })._meta.path
    );
    return { ...doc, locale, slug };
  },
});

export default defineConfig({
  collections: [blog, category, pages],
});
