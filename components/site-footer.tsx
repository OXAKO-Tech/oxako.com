import { socialLinks } from '@/lib/archive-data'

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t-2 border-border pt-6">
      <nav aria-label="OXAKO links">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {socialLinks.map((link) => {
            const external = link.href.startsWith('http')
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="inline-flex min-h-11 items-center text-sm uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {link.label}
                  {external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
        {'Copyright © OXAKO / 2026'}
      </p>
    </footer>
  )
}
