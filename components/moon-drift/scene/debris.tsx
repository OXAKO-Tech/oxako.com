'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, type InstancedMesh } from 'three'
import { CFG, type MoonDriftEngine } from '@/lib/moon-drift/engine'
import { createRockGeometry, smoothstep } from './assets'

const MAX = 40

export function Debris({ engine }: { engine: MoonDriftEngine }) {
  const body = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const geometry = useMemo(() => createRockGeometry(), [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const bodies = body.current
    if (!bodies) return

    let n = 0
    for (const e of engine.rocks) {
      if (!e.active) continue
      const dz = e.dist - engine.travel
      const grow = smoothstep(CFG.spawnDist, CFG.spawnDist - 12, dz)
      const shrink = e.dying ? e.life : 1
      const scale = e.size * grow * shrink

      dummy.position.set(e.wx, e.wy, -dz)
      dummy.rotation.set(
        e.phase + engine.elapsed * e.spinX,
        engine.elapsed * e.spinY,
        engine.elapsed * e.spinZ,
      )
      dummy.scale.set(e.sx * scale, e.sy * scale, e.sz * scale)
      dummy.updateMatrix()
      bodies.setMatrixAt(n, dummy.matrix)
      n += 1
    }
    bodies.count = n
    bodies.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={body} args={[geometry, undefined, MAX]} frustumCulled={false}>
      <meshLambertMaterial color="#a9a29c" emissive="#2a2226" />
    </instancedMesh>
  )
}
