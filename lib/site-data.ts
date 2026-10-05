// Replace placeholder values here. An empty string ('') for a URL means
// "not available yet" — the UI shows "Coming soon" instead of a broken link.

export const CONTACT_EMAIL = 'hello@oxako.com'

export type Release = {
  id: string
  title: string
  year: string
  format: string
  art: string
  artAlt: string
  description: string
  credits: { role: string; name: string }[]
  listenUrl: string
  videoUrl: string
}

export const releases: Release[] = [
  {
    id: 'release-01',
    title: '[Release title]',
    year: '2026',
    format: 'Single',
    art: '/images/archive-001.webp',
    artAlt:
      'Low-poly alien seen from behind on a foggy hill, facing a broken radio tower glowing blue.',
    description:
      'A short note about the sound and the story behind the track. Replace this with the real description.',
    credits: [
      { role: 'Written and produced by', name: 'OXAKO' },
      { role: 'Mixed by', name: '[Name]' },
      { role: 'Mastered by', name: '[Name]' },
    ],
    listenUrl: '',
    videoUrl: '',
  },
  {
    id: 'release-02',
    title: '[Release title]',
    year: '2026',
    format: 'EP',
    art: '/images/archive-002.webp',
    artAlt:
      'A still lake in fog with a tall dark monolith giving off a thin blue light and a small alien on the shore.',
    description:
      'Describe the project, the instruments, and the feeling. This space fits a paragraph or two.',
    credits: [
      { role: 'Written and produced by', name: 'OXAKO' },
      { role: 'Vocals', name: '[Name]' },
      { role: 'Artwork', name: '[Name]' },
    ],
    listenUrl: '',
    videoUrl: '',
  },
  {
    id: 'release-03',
    title: '[Release title]',
    year: '2026',
    format: 'Remix',
    art: '/images/archive-003.webp',
    artAlt:
      'An empty path through bare angular trees in dense fog, leading toward a small glowing blue light.',
    description:
      'Add context for the release, the collaborators, and how it came together.',
    credits: [
      { role: 'Remix and production', name: 'OXAKO' },
      { role: 'Original artist', name: '[Name]' },
      { role: 'Visuals', name: '[Name]' },
    ],
    listenUrl: '',
    videoUrl: '',
  },
]

export type Video = {
  id: string
  title: string
  kind: 'Visualizer' | 'Music video' | 'Short film' | 'Experiment'
  year: string
  poster: string
  posterAlt: string
  url: string
}

export const videos: Video[] = [
  {
    id: 'video-01',
    title: '[Video title]',
    kind: 'Music video',
    year: '2026',
    poster: '/images/oxako-hero.webp',
    posterAlt: 'A lone low-poly alien on a foggy plain facing a broken tower lit in blue.',
    url: '',
  },
  {
    id: 'video-02',
    title: '[Video title]',
    kind: 'Visualizer',
    year: '2026',
    poster: '/images/archive-002.webp',
    posterAlt: 'A dark monolith over a misty lake, glowing faintly blue.',
    url: '',
  },
  {
    id: 'video-03',
    title: '[Video title]',
    kind: 'Short film',
    year: '2026',
    poster: '/images/archive-003.webp',
    posterAlt: 'A foggy forest path leading to a small blue light.',
    url: '',
  },
  {
    id: 'video-04',
    title: '[Video title]',
    kind: 'Experiment',
    year: '2026',
    poster: '/images/archive-001.webp',
    posterAlt: 'An alien watching a radio tower on a hill in the fog.',
    url: '',
  },
]

export type LinkIcon =
  | 'spotify'
  | 'apple'
  | 'soundcloud'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'email'
  | 'landr'
  | 'web'

export type PlatformLink = {
  label: string
  description: string
  href: string
  icon: LinkIcon
  group: 'Listen' | 'Watch and follow' | 'Connect'
}

export const platformLinks: PlatformLink[] = [
  { label: 'Spotify', description: 'Stream releases', href: 'https://open.spotify.com/', icon: 'spotify', group: 'Listen' },
  { label: 'Apple Music', description: 'Stream releases', href: 'https://music.apple.com/', icon: 'apple', group: 'Listen' },
  { label: 'SoundCloud', description: 'Demos and previews', href: 'https://soundcloud.com/', icon: 'soundcloud', group: 'Listen' },
  { label: 'Latest release', description: 'LANDR promolink', href: '', icon: 'landr', group: 'Listen' },
  { label: 'YouTube', description: 'Videos and visualizers', href: 'https://www.youtube.com/', icon: 'youtube', group: 'Watch and follow' },
  { label: 'Instagram', description: 'Updates and artwork', href: 'https://www.instagram.com/', icon: 'instagram', group: 'Watch and follow' },
  { label: 'TikTok', description: 'Short clips', href: 'https://www.tiktok.com/', icon: 'tiktok', group: 'Watch and follow' },
  { label: 'Email', description: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: 'email', group: 'Connect' },
  { label: 'oxakopage', description: 'More from OXAKO', href: '', icon: 'web', group: 'Connect' },
]

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Music', href: '/music' },
  { label: 'Videos', href: '/videos' },
  { label: 'Links', href: '/links' },
  { label: 'Contact', href: '/contact' },
] as const

export const TUNER = {
  min: 88.0,
  max: 108.0,
  step: 0.1,
  target: 101.1,
  tolerance: 0.4,
} as const
