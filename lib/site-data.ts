// Replace placeholder values here. An empty string ('') for a URL means
// "not available yet" — the UI hides that button/link entirely until a real
// URL is added. Never put a generic homepage URL here as a stand-in.

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

// Add the official OXAKO profile URLs here. Empty = hidden everywhere.
export const SOCIAL_URLS: Record<
  'spotify' | 'apple' | 'tidal' | 'iheart' | 'audiomack' | 'youtube' | 'instagram',
  string
> = {
  spotify: 'https://open.spotify.com/artist/6borqbLlH9DTlXn5fCvYHR',
  apple: 'https://music.apple.com/us/artist/oxako/1893109904',
  tidal: 'https://tidal.com/artist/77889960',
  iheart: 'https://www.iheart.com/artist/oxako-50387023',
  audiomack: 'https://audiomack.com/oxako',
  youtube: '',
  instagram: 'https://www.instagram.com/_oxako_/',
}

// Set only when an active release or pre-save exists.
export const LANDR_PROMOLINK = ''

// Optional future link.
export const OXAKOPAGE_URL = ''

export type LinkIcon =
  | 'spotify'
  | 'apple'
  | 'tidal'
  | 'iheart'
  | 'audiomack'
  | 'youtube'
  | 'instagram'
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

const allPlatformLinks: PlatformLink[] = [
  { label: 'Spotify', description: 'Stream releases', href: SOCIAL_URLS.spotify, icon: 'spotify', group: 'Listen' },
  { label: 'Apple Music', description: 'Stream releases', href: SOCIAL_URLS.apple, icon: 'apple', group: 'Listen' },
  { label: 'Tidal', description: 'Stream releases', href: SOCIAL_URLS.tidal, icon: 'tidal', group: 'Listen' },
  { label: 'iHeartRadio', description: 'Stream releases', href: SOCIAL_URLS.iheart, icon: 'iheart', group: 'Listen' },
  { label: 'Audiomack', description: 'Stream releases', href: SOCIAL_URLS.audiomack, icon: 'audiomack', group: 'Listen' },
  { label: 'Latest release', description: 'LANDR promolink', href: LANDR_PROMOLINK, icon: 'landr', group: 'Listen' },
  { label: 'YouTube', description: 'New releases and updates', href: SOCIAL_URLS.youtube, icon: 'youtube', group: 'Watch and follow' },
  { label: 'Instagram', description: 'Updates and artwork', href: SOCIAL_URLS.instagram, icon: 'instagram', group: 'Watch and follow' },
  { label: 'Email', description: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, icon: 'email', group: 'Connect' },
  { label: 'oxakopage', description: 'More from OXAKO', href: OXAKOPAGE_URL, icon: 'web', group: 'Connect' },
]

// Only links with a real URL are public.
export const platformLinks: PlatformLink[] = allPlatformLinks.filter((link) => link.href !== '')

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Music', href: '/music' },
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
