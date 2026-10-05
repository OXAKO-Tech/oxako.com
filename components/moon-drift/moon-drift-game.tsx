'use client'

import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useState } from 'react'
import { MoonDriftEngine, type HudState } from '@/lib/moon-drift/engine'
import { cn } from '@/lib/utils'
import { FRAME_CLASS } from './frame'
import { Hud } from './hud'
import { Overlays, type RunResult } from './overlays'
import { Scene } from './scene/scene'
import { TouchControls } from './touch-controls'
import { useMoonDriftInput } from './use-moon-drift-input'

type Phase = 'idle' | 'playing' | 'paused' | 'over'

const BEST_KEY = 'oxako-moon-drift-best'
const EMPTY_RESULT: RunResult = { score: 0, best: 0, isNewBest: false, seconds: 0 }

export default function MoonDriftGame() {
  const [engine] = useState(() => new MoonDriftEngine())
  const [phase, setPhase] = useState<Phase>('idle')
  const [hud, setHud] = useState<HudState>(() => engine.snapshot())
  const [result, setResult] = useState<RunResult>(EMPTY_RESULT)
  const [best, setBest] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [contextLost, setContextLost] = useState(false)

  const pause = useCallback(() => {
    engine.running = false
    setPhase((current) => (current === 'playing' ? 'paused' : current))
  }, [engine])

  const resume = useCallback(() => {
    engine.running = true
    setPhase((current) => (current === 'paused' ? 'playing' : current))
  }, [engine])

  const togglePause = useCallback(() => {
    if (engine.running) pause()
    else resume()
  }, [engine, pause, resume])

  const start = useCallback(() => {
    engine.reset()
    engine.running = true
    setHud(engine.snapshot())
    setAnnouncement('Flight started')
    setPhase('playing')
  }, [engine])

  const { input, dragHandlers } = useMoonDriftInput({ engine, phase, onTogglePause: togglePause })

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(BEST_KEY))
    if (Number.isFinite(stored) && stored > 0) setBest(stored)

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    engine.events = {
      onCollect: (kind) => {
        if (kind === 2) setAnnouncement('Double points for six seconds')
      },
      onHit: (shieldsLeft) => {
        setAnnouncement(shieldsLeft === 1 ? 'Shield hit. 1 shield left' : `Shield hit. ${shieldsLeft} shields left`)
      },
      onShieldRestored: (shields) => {
        setAnnouncement(shields === 1 ? 'Shield restored. 1 shield' : `Shield restored. ${shields} shields`)
      },
      onEnd: (_reason, score) => {
        const previous = Number(window.localStorage.getItem(BEST_KEY)) || 0
        const isNewBest = score > previous
        const nextBest = Math.max(score, previous)
        const seconds = Math.floor(engine.elapsed)
        if (isNewBest) window.localStorage.setItem(BEST_KEY, String(score))
        setBest(nextBest)
        setResult({ score, best: nextBest, isNewBest, seconds })
        setHud(engine.snapshot())
        setAnnouncement(`Shields down after ${seconds} seconds. Score ${score}`)
        setPhase('over')
      },
    }
    return () => {
      engine.events = {}
      engine.running = false
    }
  }, [engine])

  // The HUD is React state, so refresh it a few times a second rather than every frame
  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => setHud(engine.snapshot()), 100)
    return () => window.clearInterval(id)
  }, [phase, engine])

  useEffect(() => {
    if (phase !== 'playing') return
    const onVisibility = () => {
      if (document.hidden) pause()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [phase, pause])

  const playing = phase === 'playing'

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        role="group"
        aria-label="Moon Drift game"
        aria-describedby="moon-drift-help"
        className={cn(FRAME_CLASS, playing && 'touch-none select-none')}
        {...dragHandlers}
      >
        <Canvas
          aria-hidden="true"
          frameloop={playing ? 'always' : 'demand'}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, 3.3, 11], fov: 55 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              setContextLost(true)
              pause()
            })
          }}
        >
          <Scene engine={engine} input={input} phase={phase} reducedMotion={reducedMotion} />
        </Canvas>

        {(playing || phase === 'paused') && <Hud hud={hud} onPause={pause} />}
        {phase !== 'playing' && (
          <Overlays phase={phase} best={best} result={result} onStart={start} onResume={resume} />
        )}

        {contextLost && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
            <h3 className="font-pixel text-lg text-foreground">Graphics paused</h3>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              The browser stopped the 3D view. Reload the page to fly again.
            </p>
          </div>
        )}
      </div>

      <TouchControls input={input} />
      <p id="moon-drift-help" className="text-sm leading-relaxed text-muted-foreground">
        Steer with WASD or the arrow keys, or drag on touch screens. Boost with Space or the Boost button. Pause with P.
      </p>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
