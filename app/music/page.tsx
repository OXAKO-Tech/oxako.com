import type { Metadata } from 'next'
import { HiddenTrack } from '@/components/hidden-track'
import { PageHeader } from '@/components/page-header'
import { ReleaseGrid } from '@/components/release-grid'

export const metadata: Metadata = {
  title: 'Music',
  description: 'Listen to selected OXAKO releases, projects, and previews.',
}

export default function MusicPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Music"
        description="Listen to selected OXAKO releases, projects, and previews."
        aside="Sounds from elsewhere."
      />
      <ReleaseGrid />
      <HiddenTrack />
    </div>
  )
}
