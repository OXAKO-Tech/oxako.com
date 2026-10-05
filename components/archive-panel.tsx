'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import type { ArchiveEntry } from '@/lib/archive-data'
import { AudioPreviewPlaceholder } from '@/components/audio-preview-placeholder'
import { PixelButton, pixelButtonClass } from '@/components/pixel-button'

type LinkKind = 'listen' | 'watch'

export function ArchivePanel({
  entry,
  onClose,
}: {
  entry: ArchiveEntry | null
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [pending, setPending] = useState<LinkKind | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (entry && !dialog.open) {
      setPending(null)
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!entry && dialog.open) {
      dialog.close()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [entry])

  function handleLink(e: React.MouseEvent, kind: LinkKind, href: string) {
    if (href === '#') {
      e.preventDefault()
      setPending(kind)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="panel-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close()
      }}
      className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto bg-transparent p-0 text-foreground backdrop:bg-background/85 backdrop:backdrop-blur-sm"
    >
      {entry && (
        <div className="facet bg-border p-px">
          <div className="facet-inner bg-card">
            <div className="flex items-center justify-between gap-4 border-b-2 border-border bg-background/60 px-4 py-2">
              <p className="truncate text-sm uppercase tracking-widest text-muted-foreground">
                {'FILE: '}
                <span className="text-primary">{entry.code}.SIG</span>
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close archive file"
                className="flex size-11 shrink-0 items-center justify-center text-muted-foreground hover:text-primary"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="flex flex-col gap-4">
                <div className="facet-sm relative aspect-square bg-muted">
                  <Image
                    src={entry.art}
                    alt={entry.artAlt}
                    fill
                    sizes="(min-width: 768px) 320px, 90vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="scanlines pointer-events-none absolute inset-0 opacity-50"
                  />
                </div>
                <AudioPreviewPlaceholder label="AUDIO PREVIEW" />
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <h2
                    id="panel-title"
                    className="font-pixel text-sm leading-relaxed text-foreground sm:text-base sm:leading-relaxed"
                  >
                    {entry.code}
                    <span className="text-primary"> — </span>
                    {entry.title}
                  </h2>
                  <p className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">
                    {entry.format} · {entry.year} · {entry.duration}
                  </p>
                </div>

                <p className="leading-relaxed text-foreground/90">
                  {entry.description}
                </p>

                <section aria-label="Credits">
                  <h3 className="mb-2 text-sm uppercase tracking-widest text-primary">
                    CREDITS
                  </h3>
                  <dl className="flex flex-col gap-1 text-sm">
                    {entry.credits.map((credit) => (
                      <div
                        key={credit.role}
                        className="flex flex-wrap justify-between gap-x-4 border-b border-border py-1.5"
                      >
                        <dt className="text-muted-foreground">{credit.role}</dt>
                        <dd className="text-foreground">{credit.name}</dd>
                      </div>
                    ))}
                  </dl>
                </section>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={entry.listenUrl}
                    onClick={(e) => handleLink(e, 'listen', entry.listenUrl)}
                    className={pixelButtonClass('primary')}
                  >
                    LISTEN
                  </a>
                  <a
                    href={entry.watchUrl}
                    onClick={(e) => handleLink(e, 'watch', entry.watchUrl)}
                    className={pixelButtonClass('ghost')}
                  >
                    WATCH
                  </a>
                  <PixelButton onClick={() => dialogRef.current?.close()}>
                    CLOSE
                  </PixelButton>
                </div>

                <p role="status" className="min-h-5 text-sm text-muted-foreground">
                  {pending &&
                    `> ${pending.toUpperCase()} LINK NOT ASSIGNED YET. TRANSMISSION PENDING.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
