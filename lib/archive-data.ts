export type ArchiveEntry = {
  id: string
  code: string
  title: string
  year: string
  format: string
  duration: string
  art: string
  artAlt: string
  description: string
  credits: { role: string; name: string }[]
  listenUrl: string
  watchUrl: string
}

// "#" means the link is not assigned yet; the panel shows a pending notice instead of navigating.
export const archive: ArchiveEntry[] = [
  {
    id: 'archive-001',
    code: 'ARCHIVE_001',
    title: '[TITLE]',
    year: '2026',
    format: 'SINGLE',
    duration: '00:00',
    art: '/images/archive-001.png',
    artAlt:
      'Low-poly alien seen from behind on a foggy gray-green hill, facing a broken radio tower glowing electric blue.',
    description:
      'Placeholder description. A short note about the sound, the mood, and the world this transmission came from. Replace with the real story behind the track.',
    credits: [
      { role: 'WRITTEN + PRODUCED', name: 'OXAKO' },
      { role: 'MIXED BY', name: '[NAME]' },
      { role: 'MASTERED BY', name: '[NAME]' },
    ],
    listenUrl: '#',
    watchUrl: '#',
  },
  {
    id: 'archive-002',
    code: 'ARCHIVE_002',
    title: '[TITLE]',
    year: '2026',
    format: 'EP',
    duration: '00:00',
    art: '/images/archive-002.png',
    artAlt:
      'A still gray-green lake in fog with a tall dark monolith emitting a thin blue light and a tiny low-poly alien on the shore.',
    description:
      'Placeholder description. Describe the project, the instruments, the feeling. This panel is built to hold a paragraph or two without any other layout changes.',
    credits: [
      { role: 'WRITTEN + PRODUCED', name: 'OXAKO' },
      { role: 'VOCALS', name: '[NAME]' },
      { role: 'ARTWORK', name: '[NAME]' },
    ],
    listenUrl: '#',
    watchUrl: '#',
  },
  {
    id: 'archive-003',
    code: 'ARCHIVE_003',
    title: '[TITLE]',
    year: '2026',
    format: 'REMIX',
    duration: '00:00',
    art: '/images/archive-003.png',
    artAlt:
      'An empty path through dead angular trees in dense fog leading toward a small glowing blue beacon.',
    description:
      'Placeholder description. Add context for the release, collaborators, and where it fits in the wider OXAKO archive.',
    credits: [
      { role: 'REMIX + PRODUCTION', name: 'OXAKO' },
      { role: 'ORIGINAL ARTIST', name: '[NAME]' },
      { role: 'VISUALS', name: '[NAME]' },
    ],
    listenUrl: '#',
    watchUrl: '#',
  },
]

export const socialLinks = [
  { label: 'SPOTIFY', href: 'https://open.spotify.com/' },
  { label: 'SOUNDCLOUD', href: 'https://soundcloud.com/' },
  { label: 'YOUTUBE', href: 'https://www.youtube.com/' },
  { label: 'INSTAGRAM', href: 'https://www.instagram.com/' },
  { label: 'EMAIL', href: 'mailto:hello@oxako.com' },
] as const

// Tuner configuration
export const TUNER = {
  min: 88.0,
  max: 108.0,
  step: 0.1,
  target: 101.1,
  tolerance: 0.4,
} as const
