// An empty string ('') for a URL means "not available yet" — the UI hides that
// link everywhere until a real URL is added. Never use a generic homepage URL
// as a stand-in.

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
  | 'landr'
  | 'web'

export type PlatformLink = {
  label: string
  description: string
  href: string
  icon: LinkIcon
}

const allPlatformLinks: PlatformLink[] = [
  { label: 'Spotify', description: 'Listen', href: SOCIAL_URLS.spotify, icon: 'spotify' },
  { label: 'Apple Music', description: 'Listen', href: SOCIAL_URLS.apple, icon: 'apple' },
  { label: 'YouTube', description: 'Watch', href: SOCIAL_URLS.youtube, icon: 'youtube' },
  { label: 'Tidal', description: 'Listen', href: SOCIAL_URLS.tidal, icon: 'tidal' },
  { label: 'iHeartRadio', description: 'Listen', href: SOCIAL_URLS.iheart, icon: 'iheart' },
  { label: 'Audiomack', description: 'Listen', href: SOCIAL_URLS.audiomack, icon: 'audiomack' },
  { label: 'Instagram', description: 'Follow', href: SOCIAL_URLS.instagram, icon: 'instagram' },
  { label: 'Latest release', description: 'Listen now', href: LANDR_PROMOLINK, icon: 'landr' },
  { label: 'oxakopage', description: 'Visit', href: OXAKOPAGE_URL, icon: 'web' },
]

// Only links with a real URL are public.
export const platformLinks: PlatformLink[] = allPlatformLinks.filter(
  (link) => link.href !== '',
)

// Destinations shown on the Music page (everything except the optional oxakopage).
export const musicLinks: PlatformLink[] = platformLinks.filter(
  (link) => link.icon !== 'web',
)

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Music', href: '/music' },
  { label: 'Links', href: '/links' },
  { label: 'Contact', href: '/contact' },
] as const
