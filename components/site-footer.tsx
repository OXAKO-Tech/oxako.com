import Link from 'next/link'
import { navLinks } from '@/lib/site-data'

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-pixel text-sm text-foreground">OXAKO</p>
          <p className="text-sm text-muted-foreground">Producer and Sound Designer</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-muted-foreground">
            {'© 2026 OXAKO. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
