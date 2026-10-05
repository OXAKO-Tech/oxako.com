import Image from 'next/image'
import { Camera, MonitorPlay } from 'lucide-react'
import { pixelButtonClass } from '@/components/pixel-button'
import { SOCIAL_URLS } from '@/lib/site-data'
import { cn } from '@/lib/utils'

type VisualsSectionProps = {
  variant?: 'page' | 'compact'
}

const followLinks = [
  { label: 'Follow on YouTube', href: SOCIAL_URLS.youtube, icon: MonitorPlay, variant: 'primary' },
  { label: 'Follow on Instagram', href: SOCIAL_URLS.instagram, icon: Camera, variant: 'ghost' },
] as const

export function VisualsSection({ variant = 'compact' }: VisualsSectionProps) {
  const isPage = variant === 'page'
  const Heading = isPage ? 'h1' : 'h2'

  return (
    <section
      aria-labelledby="visuals-title"
      className="facet bg-border p-px"
    >
      <div
        className={cn(
          'facet-inner flex flex-col bg-card md:flex-row',
          isPage ? 'md:min-h-[28rem]' : 'md:min-h-72',
        )}
      >
        <div
          className={cn(
            'relative aspect-[16/10] overflow-hidden md:aspect-auto',
            isPage ? 'md:w-1/2' : 'md:w-2/5',
          )}
        >
          <Image
            src="/images/archive-002.webp"
            alt="A dark monolith rises from a still, foggy lake, giving off a thin blue light."
            fill
            priority={isPage}
            sizes={isPage ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
            className="object-cover"
          />
          <span aria-hidden="true" className="scanlines absolute inset-0 opacity-40" />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent md:bg-gradient-to-l"
          />
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col justify-center gap-5 p-6',
            isPage ? 'sm:p-10' : 'sm:p-8',
          )}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            In development
          </p>
          <Heading
            id="visuals-title"
            className={cn(
              'font-pixel text-foreground text-glow',
              isPage ? 'text-3xl sm:text-4xl' : 'text-lg',
            )}
          >
            Visuals
          </Heading>
          <div className="flex flex-col gap-2">
            <p
              className={cn(
                'text-pretty leading-relaxed text-foreground',
                isPage ? 'text-lg' : 'text-base',
              )}
            >
              Visualizers, short films, and new OXAKO visual work are currently in development.
            </p>
            <p className="text-pretty leading-relaxed text-muted-foreground">
              Follow OXAKO on YouTube and Instagram for new releases and updates.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {followLinks.map(({ label, href, icon: Icon, variant: buttonVariant }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={pixelButtonClass(buttonVariant, 'min-h-12 justify-center px-5')}
              >
                <Icon aria-hidden="true" className="size-5" />
                {label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
