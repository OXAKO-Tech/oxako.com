'use client'

import { useState } from 'react'
import Image from 'next/image'
import { releases, type Release } from '@/lib/site-data'
import { ReleaseDialog } from '@/components/release-dialog'

export function ReleaseGrid() {
  const [selected, setSelected] = useState<Release | null>(null)

  return (
    <>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {releases.map((release) => (
          <li key={release.id}>
            <button
              type="button"
              onClick={() => setSelected(release)}
              aria-haspopup="dialog"
              className="group facet flex w-full flex-col bg-border p-px text-left transition-colors hover:bg-primary focus-visible:bg-primary"
            >
              <span className="facet-inner flex flex-col bg-card">
                <span className="relative block aspect-square overflow-hidden">
                  <Image
                    src={release.art}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="scanlines absolute inset-0 opacity-40"
                  />
                </span>
                <span className="flex items-end justify-between gap-4 p-4">
                  <span className="flex flex-col gap-1">
                    <span className="font-pixel text-xs leading-relaxed text-foreground">
                      {release.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {release.format} · {release.year}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-primary">Details</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <ReleaseDialog release={selected} onClose={() => setSelected(null)} />
    </>
  )
}
