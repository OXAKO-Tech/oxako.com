import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { PlatformLinkCard } from '@/components/platform-link-card'
import { musicLinks } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Music',
  description: 'Listen to OXAKO on your preferred platform.',
}

export default function MusicPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader title="Music" description="Listen to OXAKO on your preferred platform." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {musicLinks.map((link) => (
          <li key={link.label}>
            <PlatformLinkCard link={link} />
          </li>
        ))}
      </ul>
    </div>
  )
}
