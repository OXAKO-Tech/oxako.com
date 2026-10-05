import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Press_Start_2P } from 'next/font/google'
import { CrtOverlay } from '@/components/crt-overlay'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pixel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'OXAKO — Producer and Sound Designer',
    template: '%s — OXAKO',
  },
  description:
    'OXAKO is a music producer and sound designer. Listen to music, find OXAKO on streaming and social platforms, and get in touch for collaborations.',
  metadataBase: new URL('https://oxako.com'),
  openGraph: {
    title: 'OXAKO — Producer and Sound Designer',
    description: 'Music, visuals, and experimental worlds.',
    images: ['/images/oxako-hero.webp'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#060a12',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${plexMono.variable} ${pressStart.variable} bg-background`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CrtOverlay />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
