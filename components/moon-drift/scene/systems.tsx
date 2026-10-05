'use client'

import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import type { GameInput, MoonDriftEngine } from '@/lib/moon-drift/engine'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

interface SystemsProps {
  engine: MoonDriftEngine
  input: GameInput
  reducedMotion: boolean
}

/** Advances the game simulation, then follows the UFO with the camera. */
export function Systems({ engine, input, reducedMotion }: SystemsProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera
  const size = useThree((state) => state.size)

  const aspect = size.width / Math.max(size.height, 1)
  const baseFov = aspect < 1 ? 64 : 55
  // Pull back on narrow screens so the whole flight area stays visible
  const distance = clamp(5.8 / (Math.tan((baseFov * Math.PI) / 360) * aspect), 8.5, 13.5)

  useEffect(() => {
    camera.near = 0.1
    camera.far = 400
    camera.fov = baseFov
    camera.updateProjectionMatrix()
    engine.view.worldPerPx = (2 * distance * Math.tan((baseFov * Math.PI) / 360)) / Math.max(size.height, 1)
  }, [camera, baseFov, distance, engine, size.height])

  useFrame((_, delta) => {
    engine.update(delta, input)

    const shake = reducedMotion ? 0 : engine.hitPulse * 0.35
    const jitterX = shake ? (Math.random() - 0.5) * shake : 0
    const jitterY = shake ? (Math.random() - 0.5) * shake : 0

    camera.position.set(engine.px * 0.5 + jitterX, 3.3 + (engine.py - 1.6) * 0.25 + jitterY, distance)
    camera.lookAt(engine.px * 0.6, 2.4, -8)

    const kick = reducedMotion ? 0 : engine.boosting ? 4 : 0
    const targetFov = baseFov + kick
    if (Math.abs(camera.fov - targetFov) > 0.02) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, delta * 12)
      camera.updateProjectionMatrix()
    }
  }, -1)

  return null
}
