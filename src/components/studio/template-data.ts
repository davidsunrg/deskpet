export type StudioTemplateKind = 'photo' | 'video' | 'album' | 'page';

export type StudioTemplate = {
  id: string;
  kind: StudioTemplateKind;
  name: string;
  description: string;
  preview: string;
  badge?: string;
};

export const studioTemplates: StudioTemplate[] = [
  {
    id: 'photo-storybook',
    kind: 'photo',
    name: 'Storybook Portrait',
    description: 'A soft illustrated portrait with a hand-painted finish.',
    preview: '/studio/flowers.png',
    badge: 'Popular',
  },
  {
    id: 'photo-adventure',
    kind: 'photo',
    name: 'Outdoor Adventure',
    description: 'Place your pet in a bright, cinematic landscape.',
    preview: '/studio/hiking.png',
  },
  {
    id: 'photo-summer',
    kind: 'photo',
    name: 'Summer Postcard',
    description: 'A sunny travel portrait ready to share.',
    preview: '/studio/beach.png',
  },
  {
    id: 'video-memory',
    kind: 'video',
    name: 'Memory Reel',
    description: 'Turn favorite moments into a gentle highlight reel.',
    preview: '/studio/interactive.png',
    badge: 'New',
  },
  {
    id: 'video-day',
    kind: 'video',
    name: 'A Day Together',
    description: 'A playful sequence built around one special day.',
    preview: '/studio/desktop.png',
  },
  {
    id: 'video-journey',
    kind: 'video',
    name: 'Little Journeys',
    description: 'A cinematic montage for walks and adventures.',
    preview: '/studio/hiking.png',
  },
  {
    id: 'album-classic',
    kind: 'album',
    name: 'Classic Keepsake',
    description: 'A timeless album with spacious photo-led pages.',
    preview: '/studio/memorial.png',
    badge: 'Popular',
  },
  {
    id: 'album-seasons',
    kind: 'album',
    name: 'Seasons Together',
    description: 'Tell your story from season to season.',
    preview: '/studio/flowers.png',
  },
  {
    id: 'album-letter',
    kind: 'album',
    name: 'A Letter to You',
    description: 'Pair personal notes with the moments you treasure.',
    preview: '/studio/portrait.png',
  },
  {
    id: 'page-journal',
    kind: 'page',
    name: 'Daily Journal',
    description: 'A warm timeline for everyday stories and milestones.',
    preview: '/studio/flowers.png',
    badge: 'Recommended',
  },
  {
    id: 'page-gallery',
    kind: 'page',
    name: 'Gallery First',
    description: 'A visual homepage that puts photos center stage.',
    preview: '/studio/beach.png',
  },
  {
    id: 'page-keepsake',
    kind: 'page',
    name: 'Forever Loved',
    description: 'A quiet, thoughtful page for a lasting tribute.',
    preview: '/studio/memorial.png',
  },
];

export function getTemplatesByKind(kind: StudioTemplateKind) {
  return studioTemplates.filter((template) => template.kind === kind);
}
