import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { pixelButtonClass } from '@/components/pixel-button'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'For collaborations, production, licensing, and creative projects.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:gap-16">
      <section className="flex flex-1 flex-col items-start gap-6">
        <h1 className="font-pixel text-3xl leading-snug text-foreground text-balance sm:text-5xl">
          Contact
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-foreground text-pretty sm:text-xl">
          For collaborations, production, licensing, and creative projects.
        </p>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
          Direct contact options are being prepared.
        </p>
        <Link href="/links" className={pixelButtonClass('primary', 'mt-2')}>
          Find OXAKO
        </Link>
      </section>
      <div className="relative aspect-square w-full max-w-sm shrink-0 border-2 border-border shadow-[6px_6px_0_0_var(--border)] lg:max-w-md">
        <Image
          src="/images/oxako-hero.webp"
          alt="Retro low-poly alien from the OXAKO world"
          fill
          sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}
