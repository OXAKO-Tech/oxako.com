'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { archive, TUNER, type ArchiveEntry } from '@/lib/archive-data'
import { ArchivePanel } from '@/components/archive-panel'
import { AudioPreviewPlaceholder } from '@/components/audio-preview-placeholder'
import { FrequencyTuner } from '@/components/frequency-tuner'
import { PixelButton } from '@/components/pixel-button'
import { SiteFooter } from '@/components/site-footer'

const bootLines = [
  'OXAKO_OS v0.1 — LOW-POWER MODE',
  'CARRIER FOUND. DECRYPTING INDEX...',
  `${archive.length} FILES RECOVERED. 1 SIGNAL STILL HIDDEN.`,
]

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm uppercase tracking-widest text-muted-foreground">
      <span className="text-primary">{'> '}</span>
      {children}
    </p>
  )
}

export function ArchiveTerminal({ onExit }: { onExit: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [active, setActive] = useState<ArchiveEntry | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const unlock = useCallback(() => setUnlocked(true), [])

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="relative min-h-dvh">
      <div aria-hidden="true" className="fixed inset-0 -z-0">
        <Image
          src="/images/oxako-hero.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
      </div>

      <div className="relative mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-10">
        <div className="facet bg-border p-px">
          <div className="facet-inner bg-card/95">
            <div className="flex items-center justify-between gap-4 border-b-2 border-border bg-background/60 px-4 py-2">
              <p className="truncate text-sm uppercase tracking-widest text-muted-foreground">
                OXAKO_OS // ARCHIVE
              </p>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex min-h-11 items-center text-sm uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                [ EXIT ]
              </button>
            </div>

            <main className="flex flex-col gap-10 p-4 sm:p-8">
              <header className="flex flex-col gap-4">
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-pixel text-lg leading-relaxed text-foreground outline-none sm:text-2xl sm:leading-relaxed"
                >
                  ARCHIVE ACCESS GRANTED
                  <span
                    aria-hidden="true"
                    className="ml-2 inline-block h-[0.9em] w-[0.55em] translate-y-[0.1em] animate-blink bg-primary"
                  />
                </h1>
                <ul className="flex flex-col gap-1">
                  {bootLines.map((line, i) => (
                    <li
                      key={line}
                      className="animate-boot text-sm uppercase tracking-widest text-muted-foreground"
                      style={{ animationDelay: `${i * 260}ms` }}
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </header>

              <section aria-labelledby="files-heading" className="flex flex-col gap-4">
                <h2 id="files-heading" className="sr-only">
                  Archive files
                </h2>
                <Prompt>ls /archive</Prompt>
                <ul className="flex flex-col gap-3">
                  {archive.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => setActive(entry)}
                        aria-haspopup="dialog"
                        className="group flex w-full items-center gap-4 border-2 border-border bg-background/50 p-3 text-left transition-colors hover:border-primary hover:bg-background"
                      >
                        <span className="relative size-16 shrink-0 overflow-hidden bg-muted sm:size-20">
                          <Image
                            src={entry.art}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="font-pixel text-xs leading-relaxed text-foreground group-hover:text-primary sm:text-sm sm:leading-relaxed">
                            {entry.code} — {entry.title}
                          </span>
                          <span className="text-sm uppercase tracking-widest text-muted-foreground">
                            {entry.format} · {entry.year}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="hidden font-pixel text-xs text-primary sm:block"
                        >
                          OPEN &gt;
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="tuner-heading" className="flex flex-col gap-4">
                <h2
                  id="tuner-heading"
                  className="font-pixel text-sm leading-relaxed text-foreground sm:text-base"
                >
                  TUNE THE SIGNAL
                </h2>
                <Prompt>tune --range {TUNER.min.toFixed(0)}-{TUNER.max.toFixed(0)}</Prompt>
                <p className="max-w-prose leading-relaxed text-foreground/80">
                  Something is broadcasting between the stations. Drag the dial, or
                  use the arrow keys, until the static breaks.
                </p>
                <FrequencyTuner unlocked={unlocked} onUnlock={unlock} />
                <p role="status" className="sr-only">
                  {unlocked ? 'Hidden transmission unlocked.' : ''}
                </p>
              </section>

              {unlocked && (
                <section
                  aria-labelledby="transmission-heading"
                  className="animate-boot border-2 border-primary bg-background/70 p-4 shadow-[0_0_28px_-6px_var(--primary)] sm:p-6"
                >
                  <p className="text-sm uppercase tracking-widest text-primary">
                    {'// HIDDEN TRANSMISSION · ' + TUNER.target.toFixed(1) + ' MHz'}
                  </p>
                  <h2
                    id="transmission-heading"
                    className="mt-3 font-pixel text-sm leading-relaxed text-foreground text-glow sm:text-base sm:leading-relaxed"
                  >
                    ARCHIVE_000 — [UNRELEASED]
                  </h2>
                  <p className="mt-4 max-w-prose leading-relaxed text-foreground/90">
                    You found the carrier. This is where an unreleased fragment, a
                    voice memo, or a message from the alien lives. Replace this
                    placeholder with the real transmission.
                  </p>
                  <div className="mt-5 max-w-md">
                    <AudioPreviewPlaceholder label="UNRELEASED FRAGMENT" />
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>

        <SiteFooter />
      </div>

      <ArchivePanel entry={active} onClose={() => setActive(null)} />
    </div>
  )
}
