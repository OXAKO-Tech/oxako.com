import { ArrowUpRight, Globe, Rocket, type LucideIcon } from 'lucide-react'
import type { LinkIcon, PlatformLink } from '@/lib/site-data'

export const brandLogos: Partial<Record<LinkIcon, string>> = {
  spotify: '/brands/spotify.svg',
  apple: '/brands/apple-music.svg',
  tidal: '/brands/tidal.svg',
  iheart: '/brands/iheartradio.svg',
  audiomack: '/brands/audiomack.svg',
  youtube: '/brands/youtube.svg',
  instagram: '/brands/instagram.svg',
}

const fallbackIcons: Partial<Record<LinkIcon, LucideIcon>> = {
  landr: Rocket,
  web: Globe,
}

export function PlatformLinkCard({ link }: { link: PlatformLink }) {
  const logo = brandLogos[link.icon]
  const FallbackIcon = fallbackIcons[link.icon] ?? Globe
  if (!link.href) return null
  const external = link.href.startsWith('http')

  const inner = (
    <span className="facet-inner flex min-h-20 w-full items-center gap-4 bg-card px-5 py-4">
      <span className="flex size-11 shrink-0 items-center justify-center border-2 border-border text-primary transition-colors group-hover:border-primary">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            width={28}
            height={28}
            className="size-7 object-contain"
            aria-hidden="true"
          />
        ) : (
          <FallbackIcon className="size-5" aria-hidden="true" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-pixel text-xs leading-relaxed text-foreground">
          {link.label}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {link.description}
        </span>
      </span>
      <ArrowUpRight
        className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        aria-hidden="true"
      />
    </span>
  )

  return (
    <a
      href={link.href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group facet flex bg-border p-px transition-colors hover:bg-primary focus-visible:bg-primary"
    >
      {inner}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}
