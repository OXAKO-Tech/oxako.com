import Image from 'next/image'
import { PixelButton } from '@/components/pixel-button'

export function LandingScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="flex min-h-dvh p-3 sm:p-6">
      <div className="facet flex flex-1 bg-border p-px">
        <section
          aria-labelledby="landing-title"
          className="facet-inner relative flex flex-1 flex-col overflow-hidden bg-background"
        >
          <div className="relative min-h-[52dvh] flex-1">
            <Image
              src="/images/oxako-hero.png"
              alt="A low-poly alien stands alone on a foggy gray-green plain, facing a broken transmitter tower that flickers with cold blue light."
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_55%]"
            />
            <div
              aria-hidden="true"
              className="fog absolute inset-0 animate-drift opacity-80"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background"
            />
            <div className="relative flex items-start justify-between p-4 sm:p-6">
              <h1
                id="landing-title"
                className="animate-flicker font-pixel text-2xl text-foreground text-glow sm:text-4xl"
              >
                OXAKO
              </h1>
              <p className="text-right text-sm uppercase tracking-widest text-muted-foreground">
                CH-00
                <br />
                NO CARRIER
              </p>
            </div>
          </div>

          <div className="relative border-t-2 border-border bg-card/95 p-5 sm:p-8">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="font-pixel text-xs leading-loose text-foreground sm:text-sm sm:leading-loose">
                SIGNAL LOST. SEARCHING FOR OXAKO ARCHIVE...
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-[1em] w-[0.6em] translate-y-[0.15em] animate-blink bg-primary"
                />
              </p>
              <PixelButton
                variant="primary"
                onClick={onEnter}
                className="shrink-0 self-start sm:self-auto"
              >
                ENTER THE ARCHIVE
              </PixelButton>
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-sm uppercase tracking-widest text-muted-foreground">
              Copyright © OXAKO / 2026
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
