import type { Metadata } from 'next'
import { VisualsSection } from '@/components/visuals-section'

export const metadata: Metadata = {
  title: 'Visuals',
  description:
    'Visualizers, short films, and new OXAKO visual work are currently in development. Follow OXAKO on YouTube and Instagram for updates.',
}

export default function VisualsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-12 sm:px-6 sm:py-16">
      <VisualsSection variant="page" />
    </div>
  )
}
