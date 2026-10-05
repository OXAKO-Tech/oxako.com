'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { TUNER } from '@/lib/archive-data'
import { PixelButton } from '@/components/pixel-button'

const { min, max, step, target, tolerance } = TUNER
const SEGMENTS = 12

function clamp(n: number) {
  return Math.min(max, Math.max(min, Math.round(n / step) * step))
}

function describe(strength: number, locked: boolean) {
  if (locked) return 'CARRIER LOCKED'
  if (strength < 0.25) return 'STATIC'
  if (strength < 0.55) return 'FAINT CARRIER'
  if (strength < 0.85) return 'SIGNAL NEARBY'
  return 'ALMOST THERE'
}

export function FrequencyTuner({
  unlocked,
  onUnlock,
}: {
  unlocked: boolean
  onUnlock: () => void
}) {
  const [value, setValue] = useState(92.3)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const distance = Math.abs(value - target)
  const inRange = distance <= tolerance
  const strength = inRange ? 1 : Math.max(0, 1 - distance / 7)
  const percent = ((value - min) / (max - min)) * 100
  const status = describe(strength, inRange || unlocked)
  const lit = Math.round(strength * SEGMENTS)

  useEffect(() => {
    if (inRange && !unlocked) onUnlock()
  }, [inRange, unlocked, onUnlock])

  const setFromPointer = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = (clientX - rect.left) / rect.width
    setValue(clamp(min + ratio * (max - min)))
  }, [])

  function onKeyDown(e: React.KeyboardEvent) {
    const big = 1
    const keys: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    }
    if (e.key === 'Home') {
      e.preventDefault()
      setValue(min)
    } else if (e.key === 'End') {
      e.preventDefault()
      setValue(max)
    } else if (e.key in keys) {
      e.preventDefault()
      setValue((v) => clamp(v + keys[e.key]))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <p
          className="font-pixel text-xl text-primary text-glow sm:text-2xl"
          aria-hidden="true"
        >
          {value.toFixed(1)}
          <span className="ml-2 text-xs text-muted-foreground">MHz</span>
        </p>
        <p className="text-right text-sm uppercase tracking-widest text-foreground">
          {status}
        </p>
      </div>

      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Signal frequency"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(1))}
        aria-valuetext={`${value.toFixed(1)} megahertz, ${status.toLowerCase()}`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          setFromPointer(e.clientX)
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromPointer(e.clientX)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
        className="relative h-16 cursor-ew-resize touch-none select-none border-2 border-border bg-background/70"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-2 bottom-0 h-6 bg-[repeating-linear-gradient(to_right,var(--muted-foreground)_0,var(--muted-foreground)_1px,transparent_1px,transparent_10px)] opacity-60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-2 bottom-0 h-3 bg-[repeating-linear-gradient(to_right,var(--foreground)_0,var(--foreground)_2px,transparent_2px,transparent_50px)] opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-primary shadow-[0_0_14px_2px_var(--primary)]"
          style={{ left: `calc(0.5rem + (100% - 1rem) * ${percent / 100})` }}
        >
          <span className="absolute -top-px left-1/2 block size-4 -translate-x-1/2 border-2 border-primary bg-background" />
        </div>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
        <span>{min.toFixed(0)}</span>
        <span>{(min + (max - min) / 2).toFixed(0)}</span>
        <span>{max.toFixed(0)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          aria-hidden="true"
          className="flex h-5 items-end gap-1"
          title="Signal strength"
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className={
                i < lit ? 'w-2 bg-primary' : 'w-2 bg-border'
              }
              style={{ height: `${30 + (i / SEGMENTS) * 70}%` }}
            />
          ))}
        </div>
        <PixelButton
          onClick={() => setValue(target)}
          disabled={unlocked}
          aria-label="Auto-tune to the hidden signal without dragging"
        >
          AUTO-TUNE
        </PixelButton>
      </div>
    </div>
  )
}
