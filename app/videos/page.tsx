import type { Metadata } from 'next'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { videos, type Video } from '@/lib/site-data'

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Visualizers, music videos, short films, and creative experiments by OXAKO.',
}

export default function VideosPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
      <PageHeader
        title="Videos"
        description="Visualizers, music videos, short films, and creative experiments."
        aside="Watch the worlds behind the sound."
      />
      <ul className="grid gap-6 sm:grid-cols-2">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoCard video={video} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function VideoCard({ video }: { video: Video }) {
  const content = (
    <span className="facet-inner flex flex-col bg-card">
      <span className="relative block aspect-video overflow-hidden">
        <Image
          src={video.poster}
          alt={video.posterAlt}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span aria-hidden="true" className="scanlines absolute inset-0 opacity-40" />
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-14 items-center justify-center border-2 border-foreground bg-background/70 text-foreground transition-colors group-hover:border-primary group-hover:text-primary">
            <Play className="size-5" />
          </span>
        </span>
      </span>
      <span className="flex items-end justify-between gap-4 p-4">
        <span className="flex flex-col gap-1">
          <span className="font-pixel text-xs leading-relaxed text-foreground">
            {video.title}
          </span>
          <span className="text-sm text-muted-foreground">
            {video.kind} · {video.year}
          </span>
        </span>
        <span className="shrink-0 text-sm text-primary">
          {video.url ? 'Watch' : 'Coming soon'}
        </span>
      </span>
    </span>
  )

  const frame = 'group facet flex w-full flex-col bg-border p-px transition-colors'

  if (!video.url) {
    return <div className={frame}>{content}</div>
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${frame} hover:bg-primary focus-visible:bg-primary`}
    >
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
