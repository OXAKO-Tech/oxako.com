'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { GameInput, MoonDriftEngine } from '@/lib/moon-drift/engine'
import { Backdrop } from './backdrop'
import { DayCycle } from './day-cycle'
import { Debris } from './debris'
import { Fragments } from './fragments'
import { Scenery } from './scenery'
import { Systems } from './systems'
import { BoostTrail } from './trail'
import { Ufo } from './ufo'
import { Water } from './water'

interface SceneProps {
  engine: MoonDriftEngine
  input: GameInput
  phase: string
  reducedMotion: boolean
}

export function Scene({ engine, input, phase, reducedMotion }: SceneProps) {
  const invalidate = useThree((state) => state.invalidate)

  // The canvas only renders on demand outside of play, so request one frame per state change
  useEffect(() => {
    invalidate()
  }, [phase, invalidate])

  return (
    <>
      <DayCycle engine={engine} />

      <Systems engine={engine} input={input} reducedMotion={reducedMotion} />
      <Backdrop engine={engine} />
      <Water engine={engine} />
      <Scenery engine={engine} />
      <Debris engine={engine} />
      <Fragments engine={engine} />
      {!reducedMotion && <BoostTrail engine={engine} />}
      <Ufo engine={engine} reducedMotion={reducedMotion} />
    </>
  )
}
