export const studioSections = [
  { slug: 'create', title: 'Create' },
  { slug: 'moments', title: 'Moments' },
  { slug: 'ai-generation', title: 'AI Generation' },
  { slug: 'voice', title: 'Voice' },
  { slug: 'chat', title: 'Chat' },
  { slug: 'memorial', title: 'Memorial' },
  { slug: 'gallery', title: 'Gallery' },
  { slug: 'share', title: 'Share' },
] as const;

export function getStudioSection(slug: string) {
  return studioSections.find((section) => section.slug === slug);
}
