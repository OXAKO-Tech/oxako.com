'use client'

import { useCallback, useEffect, useMemo, useRef, type PointerEvent } from 'react'
import { CFG, createInput, type MoonDriftEngine } from '@/lib/moon-drift/engine'

type Phase = 'idle' | 'playing' | 'paused' | 'over'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

interface Options {
  engine: MoonDriftEngine
  phase: Phase
  onTogglePause: () => void
}

/**
 * One input model for everything: keyboard, on-screen buttons and pointer drag
 * (mouse, touch and pen all arrive as Pointer Events) write into the same object,
 * and the engine reads it each frame.
 */
export function useMoonDriftInput({ engine, phase, onTogglePause }: Options) {
  const input = useMemo(() => createInput(), [])
  const toggleRef = useRef(onTogglePause)
  const drag = useRef<{ id: number; startX: number; startY: number; px: number; py: number } | null>(null)

  useEffect(() => {
    toggleRef.current = onTogglePause
  }, [onTogglePause])

  const release = useCallback(() => {
    input.left = false
    input.right = false
    input.up = false
    input.down = false
    input.dragging = false
    input.boost = false
    drag.current = null
  }, [input])

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'paused') {
      release()
      return
    }
    if (phase === 'paused') release()

    const setKey = (code: string, value: boolean) => {
      switch (code) {
        case 'KeyA':
        case 'ArrowLeft':
          input.left = value
          return true
        case 'KeyD':
        case 'ArrowRight':
          input.right = value
          return true
        case 'KeyW':
        case 'ArrowUp':
          input.up = value
          return true
        case 'KeyS':
        case 'ArrowDown':
          input.down = value
          return true
        default:
          return false
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (!e.repeat) toggleRef.current()
        e.preventDefault()
        return
      }
      if (phase !== 'playing') return
      if (e.code === 'Space') {
        if (!e.repeat) input.boost = true
        e.preventDefault()
        return
      }
      if (setKey(e.code, true)) e.preventDefault()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (phase !== 'playing') return
      if (e.code === 'Space') {
        // Stops a focused button from also being "clicked" by the boost key
        e.preventDefault()
        return
      }
      if (setKey(e.code, false)) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
      release()
    }
  }, [phase, input, release])

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (phase !== 'playing' || !e.isPrimary) return
      e.currentTarget.setPointerCapture(e.pointerId)
      drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, px: engine.px, py: engine.py }
      input.tx = engine.px
      input.ty = engine.py
      input.dragging = true
    },
    [phase, engine, input],
  )

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      const k = engine.view.worldPerPx * 1.35
      input.tx = clamp(d.px + (e.clientX - d.startX) * k, -CFG.xLimit, CFG.xLimit)
      input.ty = clamp(d.py - (e.clientY - d.startY) * k, CFG.yMin, CFG.yMax)
    },
    [engine, input],
  )

  const onPointerEnd = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      drag.current = null
      input.dragging = false
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    },
    [input],
  )

  return {
    input,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
    },
  }
}
