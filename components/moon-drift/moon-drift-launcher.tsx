'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState } from 'react'
import { PixelButton } from '@/components/pixel-button'
import { hasWebGL } from '@/lib/has-webgl'
import { FRAME_CLASS } from './frame'

function Poster({ children }: { children: React.ReactNode }) {
  return (
    <div className={FRAME_CLASS}>
      <Image
        src="/images/moon-drift-poster.webp"
        alt="A glowing flying saucer skimming a night sea toward a pale moon"
        fill
        sizes="(min-width: 1024px) 896px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 bg-gradient-to-t from-background via-background/50 to-transparent p-6 text-center sm:p-8">
        {children}
      </div>
    </div>
  )
}

// The three.js bundle is only requested once this component renders, which happens on Play Game
const MoonDriftGame = dynamic(() => import('./moon-drift-game'), {
  ssr: false,
  loading: () => (
    <Poster>
      <p role="status" className="font-pixel text-sm text-foreground">
        Loading Moon Drift...
      </p>
    </Poster>
  ),
})

export function MoonDriftLauncher() {
  const [launched, setLaunched] = useState(false)
  const [unsupported, setUnsupported] = useState(false)

  if (launched) return <MoonDriftGame />

  const launch = () => {
    if (hasWebGL()) setLaunched(true)
    else setUnsupported(true)
  }

  return (
    <Poster>
      <h3 className="font-pixel text-xl text-foreground sm:text-2xl">Moon Drift</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
        Skim the night sea, gather glowing fragments, and slip past the debris.
      </p>
      {unsupported ? (
        <p role="alert" className="max-w-sm text-sm leading-relaxed text-ember">
          This browser can&apos;t show 3D graphics. Try another browser or device to play.
        </p>
      ) : (
        <PixelButton variant="primary" onClick={launch}>
          Play Game
        </PixelButton>
      )}
    </Poster>
  )
}
