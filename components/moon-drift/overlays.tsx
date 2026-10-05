'use client'

import type { ReactNode } from 'react'
import { PixelButton } from '@/components/pixel-button'
import { formatTime } from './hud'

export interface RunResult {
  score: number
  best: number
  isNewBest: boolean
  seconds: number
}

interface OverlaysProps {
  phase: 'idle' | 'paused' | 'over'
  best: number
  result: RunResult
  onStart: () => void
  onResume: () => void
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/80 p-6 text-center">
      {children}
    </div>
  )
}

function Controls() {
  return (
    <ul className="flex max-w-sm flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
      <li className="pointer-fine:hidden max-sm:list-item">Drag to steer. Tap Boost to dash.</li>
      <li className="hidden pointer-fine:list-item max-sm:hidden">
        Move with WASD or the arrow keys. Press Space to boost.
      </li>
      <li>Collect glowing fragments. Dodge the debris.</li>
      <li>There is no finish line. Fly until your shields run out and chase the highest score.</li>
    </ul>
  )
}

export function Overlays({ phase, best, result, onStart, onResume }: OverlaysProps) {
  if (phase === 'idle') {
    return (
      <Panel>
        <h3 className="font-pixel text-xl text-foreground sm:text-2xl">Moon Drift</h3>
        <Controls />
        {best > 0 && <p className="text-sm text-gold">Best Score: {best}</p>}
        <PixelButton variant="primary" onClick={onStart} autoFocus>
          Launch
        </PixelButton>
      </Panel>
    )
  }

  if (phase === 'paused') {
    return (
      <Panel>
        <h3 className="font-pixel text-xl text-foreground">Paused</h3>
        <p className="text-sm text-muted-foreground">Press P or Escape to resume.</p>
        <PixelButton variant="primary" onClick={onResume} autoFocus>
          Resume
        </PixelButton>
      </Panel>
    )
  }

  return (
    <Panel>
      <div role="status" className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Shields down. You survived {formatTime(result.seconds)}.
        </p>
        <p className="font-pixel text-3xl text-foreground">{result.score}</p>
        <p className="text-base text-gold">
          Best Score: {result.best}
          {result.isNewBest && <span className="sr-only"> (new personal best)</span>}
        </p>
        {result.isNewBest && (
          <p aria-hidden="true" className="text-sm text-primary">
            New personal best
          </p>
        )}
      </div>
      <PixelButton variant="primary" onClick={onStart} autoFocus>
        Play Again
      </PixelButton>
    </Panel>
  )
}
