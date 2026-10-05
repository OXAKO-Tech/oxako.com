import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PlatformLinkCard } from '@/components/platform-link-card'
import { platformLinks } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Links',
  description: 'Official OXAKO destinations for music, videos, and updates.',
}

export default function LinksPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Find OXAKO" description="Music, videos, and updates." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {platformLinks.map((link) => (
          <li key={link.label}>
            <PlatformLinkCard link={link} />
          </li>
        ))}
      </ul>
    </div>
  )
}
