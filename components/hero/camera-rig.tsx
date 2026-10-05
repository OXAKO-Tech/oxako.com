'use client'

import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Normalised cursor position (-1..1), shared with the alien so it can glance toward the cursor
export const pointer = { x: 0, y: 0 }

export function CameraRig() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(({ camera, clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    const targetX = Math.sin(t * 0.12) * 0.35 + pointer.x * 0.55
    const targetY = 1.15 + Math.sin(t * 0.17) * 0.06 + pointer.y * 0.16
    const targetZ = 7.2 + Math.sin(t * 0.08) * 0.25
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2, delta)
    camera.lookAt(0.2, 0.2, 0)
  })

  return null
}
