import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, Press_Start_2P } from 'next/font/google'
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
  title: 'OXAKO — Signal Archive',
  description:
    'An interactive retro-console music archive by OXAKO. Atmospheric, cold, hypnotic. Enter the archive and tune the signal.',
  metadataBase: new URL('https://oxako.com'),
  openGraph: {
    title: 'OXAKO — Signal Archive',
    description:
      'Signal lost. Searching for OXAKO archive. An interactive retro-console music archive.',
    images: ['/images/oxako-hero.png'],
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
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
