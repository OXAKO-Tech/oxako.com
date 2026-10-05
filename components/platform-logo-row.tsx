import { brandLogos } from '@/components/platform-link-card'
import { musicLinks } from '@/lib/site-data'

export function PlatformLogoRow() {
  const logoLinks = musicLinks.filter((link) => brandLogos[link.icon])

  return (
    <ul className="flex flex-wrap gap-3">
      {logoLinks.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (opens in a new tab)`}
            title={link.label}
            className="facet-sm flex size-14 items-center justify-center border-2 border-border bg-card transition-colors hover:border-primary focus-visible:border-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogos[link.icon]}
              alt=""
              width={28}
              height={28}
              className="size-7 object-contain"
              aria-hidden="true"
            />
          </a>
        </li>
      ))}
    </ul>
  )
}
