import Image from 'next/image'
import Link from 'next/link'
import { pixelButtonClass } from '@/components/pixel-button'
import { VisualsSection } from '@/components/visuals-section'
import { releases } from '@/lib/site-data'

const actions = [
  { label: 'Listen to Music', href: '/music', variant: 'primary' },
  { label: 'Follow OXAKO', href: '/links', variant: 'ghost' },
  { label: 'Contact', href: '/contact', variant: 'ghost' },
] as const

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="home-title" className="relative overflow-hidden">
        <div className="relative min-h-[78dvh]">
          <Image
            src="/images/oxako-hero.webp"
            alt="A low-poly alien stands alone on a foggy plain, facing a broken tower lit with cold blue light."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_55%]"
          />
          <div aria-hidden="true" className="fog absolute inset-0 animate-drift opacity-70" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10"
          />
          <div className="relative mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-end gap-6 px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
            <h1
              id="home-title"
              className="animate-flicker font-pixel text-4xl text-foreground text-glow sm:text-6xl"
            >
              OXAKO
            </h1>
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium text-foreground sm:text-xl">
                Producer and Sound Designer
              </p>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Music, visuals, and experimental worlds.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={pixelButtonClass(action.variant)}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="latest-title"
        className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="latest-title" className="font-pixel text-lg text-foreground">
              Latest Music
            </h2>
            <p className="text-muted-foreground">Sounds from elsewhere.</p>
          </div>
          <Link
            href="/music"
            className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline"
          >
            View all music
          </Link>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:gap-6">
          {releases.map((release) => (
            <li key={release.id}>
              <Link href="/music" className="group flex flex-col gap-2">
                <span className="facet-sm relative block aspect-square overflow-hidden bg-muted">
                  <Image
                    src={release.art}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 360px, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                  {release.format} · {release.year}
                  <span className="sr-only">, {release.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <VisualsSection />
      </div>
    </>
  )
}
