export type StudioTemplateKind = 'photo' | 'video' | 'album' | 'site';

export type StudioTemplate = {
  id: string;
  kind: StudioTemplateKind;
  name: string;
  description: string;
  preview: string;
  badge?: string;
  prompt?: string;
  settings?: {
    aspectRatio?: '1:1' | '4:5' | '16:9';
    outputCount?: 1 | 2 | 4;
    duration?: '5s' | '10s' | '15s';
    resolution?: '480p' | '720p' | '1080p';
    audioEnabled?: boolean;
  };
};

export const studioTemplates: StudioTemplate[] = [
  {
    id: 'photo-storybook',
    kind: 'photo',
    name: 'Storybook Portrait',
    description: 'A soft illustrated portrait with a hand-painted finish.',
    preview: '/studio/flowers.png',
    badge: 'Popular',
    prompt:
      'A hand-painted storybook portrait of Mochi in a flower garden, soft afternoon light, warm pastel colors',
    settings: { aspectRatio: '4:5', outputCount: 2 },
  },
  {
    id: 'photo-adventure',
    kind: 'photo',
    name: 'Outdoor Adventure',
    description: 'Place your pet in a bright, cinematic landscape.',
    preview: '/studio/hiking.png',
    prompt:
      'Mochi exploring a dramatic mountain trail, cinematic landscape photography, golden hour, joyful expression',
    settings: { aspectRatio: '16:9', outputCount: 1 },
  },
  {
    id: 'photo-summer',
    kind: 'photo',
    name: 'Summer Postcard',
    description: 'A sunny travel portrait ready to share.',
    preview: '/studio/beach.png',
    prompt:
      'A cheerful summer postcard of Mochi at the beach, bright sunlight, clear blue water, playful and candid',
    settings: { aspectRatio: '1:1', outputCount: 4 },
  },
  {
    id: 'video-memory',
    kind: 'video',
    name: 'Memory Reel',
    description: 'Turn favorite moments into a gentle highlight reel.',
    preview: '/studio/interactive.png',
    badge: 'New',
    prompt:
      'A gentle montage of Mochi looking at the camera, wagging, and walking through favorite memories',
    settings: {
      duration: '10s',
      resolution: '720p',
      audioEnabled: true,
    },
  },
  {
    id: 'video-day',
    kind: 'video',
    name: 'A Day Together',
    description: 'A playful sequence built around one special day.',
    preview: '/studio/desktop.png',
    prompt:
      'Mochi wakes up, stretches, plays, and settles down for a cozy nap, smooth natural motion',
    settings: {
      duration: '15s',
      resolution: '720p',
      audioEnabled: true,
    },
  },
  {
    id: 'video-journey',
    kind: 'video',
    name: 'Little Journeys',
    description: 'A cinematic montage for walks and adventures.',
    preview: '/studio/hiking.png',
    prompt:
      'Mochi runs along a mountain path and pauses to look at the view, cinematic camera movement',
    settings: {
      duration: '5s',
      resolution: '1080p',
      audioEnabled: false,
    },
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
    id: 'site-journal',
    kind: 'site',
    name: 'Daily Journal',
    description: 'A warm timeline for everyday stories and milestones.',
    preview: '/studio/flowers.png',
    badge: 'Recommended',
  },
  {
    id: 'site-gallery',
    kind: 'site',
    name: 'Gallery First',
    description: 'A visual homepage that puts photos center stage.',
    preview: '/studio/beach.png',
  },
  {
    id: 'site-keepsake',
    kind: 'site',
    name: 'Forever Loved',
    description: 'A quiet, thoughtful page for a lasting tribute.',
    preview: '/studio/memorial.png',
  },
];

export function getTemplatesByKind(kind: StudioTemplateKind) {
  return studioTemplates.filter((template) => template.kind === kind);
}
