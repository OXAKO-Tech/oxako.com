'use client'

import { Pause } from 'lucide-react'
import { CFG, type HudState } from '@/lib/moon-drift/engine'
import { cn } from '@/lib/utils'

interface HudProps {
  hud: HudState
  onPause: () => void
}

const chip = 'bg-background/70 px-2.5 py-1.5 backdrop-blur-sm'

export function formatTime(totalSeconds: number) {
  const whole = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(whole / 60)
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`
}

export function Hud({ hud, onPause }: HudProps) {
  const boostReady = hud.boostCharge >= 1

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3" aria-hidden="true">
        <div className={cn(chip, 'flex flex-col gap-1')}>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Score</span>
          <span className="font-pixel text-lg leading-none text-foreground tabular-nums sm:text-xl">
            {hud.score}
          </span>
          {hud.multiplier && <span className="font-pixel text-xs leading-none text-gold">x2 points</span>}
        </div>

        <div className={cn(chip, 'flex flex-col items-center gap-1')}>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Stage {hud.stage}</span>
          <span className="font-pixel text-lg leading-none tabular-nums text-foreground sm:text-xl">
            {formatTime(hud.elapsed)}
          </span>
        </div>

        <div className="flex items-start gap-2">
          <div className={cn(chip, 'flex flex-col items-end gap-1.5')}>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Shields</span>
            <span className="flex gap-1">
              {Array.from({ length: CFG.shields }, (_, i) => (
                <span
                  key={i}
                  className={cn('size-4 border-2', i < hud.shields ? 'border-primary bg-primary' : 'border-border')}
                />
              ))}
            </span>
          </div>
          <button
            type="button"
            aria-label="Pause"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onPause}
            className="pointer-events-auto flex size-11 items-center justify-center border-2 border-border bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
          >
            <Pause className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex justify-center" aria-hidden="true">
        <div className={cn(chip, 'flex w-40 flex-col gap-1.5 sm:w-48')}>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide">
            <span className="text-muted-foreground">Boost</span>
            <span className={boostReady ? 'text-primary' : 'text-muted-foreground'}>
              {boostReady ? 'Ready' : 'Charging'}
            </span>
          </div>
          <div className="h-2 border border-border">
            <div
              className={cn('h-full', boostReady ? 'bg-primary' : 'bg-muted-foreground')}
              style={{ width: `${Math.round(hud.boostCharge * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
