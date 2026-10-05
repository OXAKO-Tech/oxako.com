import Link from 'next/link'
import { HeroBackdrop } from '@/components/hero/hero-backdrop'
import { pixelButtonClass } from '@/components/pixel-button'
import { PlatformLogoRow } from '@/components/platform-logo-row'
import { MoonDriftLauncher } from '@/components/moon-drift/moon-drift-launcher'

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="home-title" className="relative overflow-hidden">
        <div className="relative min-h-[85dvh]">
          <HeroBackdrop />
          <div aria-hidden="true" className="fog absolute inset-0 opacity-70" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10"
          />
          <div className="relative mx-auto flex min-h-[85dvh] max-w-6xl flex-col justify-end gap-6 px-4 pb-14 pt-24 sm:px-6 sm:pb-20">
            <h1
              id="home-title"
              className="font-pixel text-5xl text-foreground text-glow sm:text-7xl"
            >
              OXAKO
            </h1>
            <p className="max-w-xl text-lg font-medium text-foreground sm:text-xl">
              Producer and Sound Designer
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/music" className={pixelButtonClass('primary')}>
                Listen to Music
              </Link>
              <a href="#play" className={pixelButtonClass('ghost')}>
                Play Game
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        id="play"
        aria-labelledby="play-title"
        className="mx-auto flex max-w-4xl scroll-mt-16 flex-col gap-8 px-4 py-20 sm:px-6"
      >
        <div className="flex max-w-md flex-col gap-4">
          <h2 id="play-title" className="font-pixel text-2xl text-foreground">
            Moon Drift
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground text-pretty">
            Skim the night sea in a glowing saucer. Collect fragments, dodge debris, beat your best score.
          </p>
        </div>
        <MoonDriftLauncher />
      </section>

      <section
        aria-labelledby="listen-title"
        className="mx-auto flex max-w-6xl flex-col gap-6 border-t-2 border-border px-4 py-14 sm:px-6"
      >
        <h2 id="listen-title" className="font-pixel text-lg text-foreground">
          Listen to OXAKO
        </h2>
        <PlatformLogoRow />
        <Link
          href="/links"
          className="inline-flex min-h-11 items-center self-start text-sm text-primary underline-offset-4 hover:underline"
        >
          Find OXAKO
        </Link>
      </section>
    </>
  )
}
