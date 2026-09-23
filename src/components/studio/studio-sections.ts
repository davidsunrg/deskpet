export const studioSections = [
  { slug: 'moments', title: 'Moments' },
  { slug: 'create', title: 'Create' },
  { slug: 'gallery', title: 'Gallery' },
  { slug: 'ai-generation', title: 'AI Generation' },
  { slug: 'voice', title: 'Voice' },
  { slug: 'care', title: 'Care' },
  { slug: 'memorial', title: 'Memorial' },
] as const;

export function getStudioSection(slug: string) {
  return studioSections.find((section) => section.slug === slug);
}
