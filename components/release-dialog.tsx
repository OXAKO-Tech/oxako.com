'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { Release } from '@/lib/site-data'
import { AudioPreviewPlaceholder } from '@/components/audio-preview-placeholder'
import { PixelButton, pixelButtonClass } from '@/components/pixel-button'

export function ReleaseDialog({
  release,
  onClose,
}: {
  release: Release | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (release && !dialog.open) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!release && dialog.open) {
      dialog.close()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [release])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="release-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto bg-transparent p-0 text-foreground backdrop:bg-background/85 backdrop:backdrop-blur-sm"
    >
      {release && (
        <div className="facet bg-border p-px">
          <div className="facet-inner bg-card">
            <div className="flex items-center justify-between gap-4 border-b-2 border-border bg-background/60 px-4 py-2">
              <p className="text-sm text-muted-foreground">
                {release.format} · {release.year}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex size-11 shrink-0 items-center justify-center text-muted-foreground hover:text-primary"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="flex flex-col gap-4">
                <div className="facet-sm relative aspect-square bg-muted">
                  <Image
                    src={release.art}
                    alt={release.artAlt}
                    fill
                    sizes="(min-width: 768px) 320px, 90vw"
                    className="object-cover"
                  />
                </div>
                <AudioPreviewPlaceholder label="Preview" />
              </div>

              <div className="flex flex-col gap-5">
                <h2
                  id="release-title"
                  className="font-pixel text-base leading-relaxed text-foreground"
                >
                  {release.title}
                </h2>

                <p className="leading-relaxed text-foreground/90">{release.description}</p>

                <section aria-labelledby="credits-title">
                  <h3 id="credits-title" className="mb-2 text-sm font-medium text-primary">
                    Credits
                  </h3>
                  <dl className="flex flex-col text-sm">
                    {release.credits.map((credit) => (
                      <div
                        key={credit.role}
                        className="flex flex-wrap justify-between gap-x-4 border-b border-border py-2"
                      >
                        <dt className="text-muted-foreground">{credit.role}</dt>
                        <dd className="text-foreground">{credit.name}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <div className="flex flex-wrap gap-3">
                  {release.listenUrl && (
                    <ExternalLink href={release.listenUrl} label="Listen" variant="primary" />
                  )}
                  {release.videoUrl && (
                    <ExternalLink href={release.videoUrl} label="Watch Video" variant="ghost" />
                  )}
                  <PixelButton onClick={close}>Close</PixelButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}

function ExternalLink({
  href,
  label,
  variant,
}: {
  href: string
  label: string
  variant: 'primary' | 'ghost'
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={pixelButtonClass(variant)}
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
