'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PointerEvent, ReactNode } from 'react'
import type { GameInput } from '@/lib/moon-drift/engine'
import { cn } from '@/lib/utils'

interface HoldButtonProps {
  label: string
  onChange: (down: boolean) => void
  className?: string
  children: ReactNode
}

function HoldButton({ label, onChange, className, children }: HoldButtonProps) {
  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange(true)
  }
  const lift = () => onChange(false)

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={press}
      onPointerUp={lift}
      onPointerCancel={lift}
      onLostPointerCapture={lift}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        'flex min-h-16 touch-none select-none items-center justify-center border-2 border-border bg-card font-pixel text-sm uppercase text-foreground transition-colors active:border-primary active:bg-muted active:text-primary',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Large fallback controls for phones. Shown on touch devices and narrow screens. */
export function TouchControls({ input }: { input: GameInput }) {
  return (
    <div className="hidden grid-cols-[1fr_1.4fr_1fr] gap-3 max-sm:grid pointer-coarse:grid">
      <HoldButton label="Move left" onChange={(down) => (input.left = down)}>
        <ChevronLeft className="size-8" aria-hidden="true" />
      </HoldButton>
      <HoldButton
        label="Boost"
        onChange={(down) => {
          if (down) input.boost = true
        }}
        className="border-primary text-primary"
      >
        Boost
      </HoldButton>
      <HoldButton label="Move right" onChange={(down) => (input.right = down)}>
        <ChevronRight className="size-8" aria-hidden="true" />
      </HoldButton>
    </div>
  )
}
