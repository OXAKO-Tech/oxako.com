'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Object3D, type InstancedMesh } from 'three'
import type { MoonDriftEngine } from '@/lib/moon-drift/engine'

const MAX = 14
const LIFETIME = 0.4
const SPAWN_EVERY = 0.03

/** A very small ring buffer of glow puffs, only emitting while the boost is active. */
export function BoostTrail({ engine }: { engine: MoonDriftEngine }) {
  const mesh = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const puffs = useMemo(
    () => Array.from({ length: MAX }, () => ({ x: 0, y: 0, age: LIFETIME })),
    [],
  )
  const cursor = useRef(0)
  const timer = useRef(0)

  useFrame((_, delta) => {
    const instances = mesh.current
    if (!instances) return
    const dt = Math.min(delta, 0.05)

    if (engine.running && engine.boosting) {
      timer.current -= dt
      if (timer.current <= 0) {
        timer.current = SPAWN_EVERY
        const puff = puffs[cursor.current]
        puff.x = engine.px
        puff.y = engine.py - 0.05
        puff.age = 0
        cursor.current = (cursor.current + 1) % MAX
      }
    }

    let n = 0
    for (const puff of puffs) {
      if (puff.age >= LIFETIME) continue
      if (engine.running) puff.age += dt
      const t = puff.age / LIFETIME
      dummy.position.set(puff.x, puff.y, puff.age * engine.speed * 0.6 + 0.4)
      dummy.scale.setScalar(Math.max(0.0001, 0.34 * (1 - t)))
      dummy.updateMatrix()
      instances.setMatrixAt(n, dummy.matrix)
      n += 1
    }
    instances.count = n
    instances.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color="#8fe0f0"
        transparent
        opacity={0.28}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
