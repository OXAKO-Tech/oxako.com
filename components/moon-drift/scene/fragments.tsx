'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Object3D, type InstancedMesh } from 'three'
import { CFG, type MoonDriftEngine } from '@/lib/moon-drift/engine'
import { smoothstep } from './assets'

const MAX = 48
const KIND_COLORS = ['#7fe3f5', '#e6c070', '#b9a3e6']

export function Fragments({ engine }: { engine: MoonDriftEngine }) {
  const core = useRef<InstancedMesh>(null)
  const halo = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const palette = useMemo(() => KIND_COLORS.map((c) => new Color(c)), [])

  // Create the colour buffer up front so the shader never has to recompile
  useLayoutEffect(() => {
    core.current?.setColorAt(0, palette[0])
    halo.current?.setColorAt(0, palette[0])
  }, [palette])

  useFrame(() => {
    const coreMesh = core.current
    const haloMesh = halo.current
    if (!coreMesh || !haloMesh) return

    let n = 0
    for (const e of engine.fragments) {
      if (!e.active) continue
      const dz = e.dist - engine.travel
      const grow = smoothstep(CFG.spawnDist, CFG.spawnDist - 12, dz)
      const pop = e.dying ? (1 + (1 - e.life) * 0.9) * e.life : 1
      const scale = e.size * grow * pop

      dummy.position.set(e.wx, e.wy, -dz)
      dummy.rotation.set(0, e.phase + engine.elapsed * e.spinY, 0)
      dummy.scale.setScalar(Math.max(scale, 0.0001))
      dummy.updateMatrix()
      coreMesh.setMatrixAt(n, dummy.matrix)
      haloMesh.setMatrixAt(n, dummy.matrix)
      coreMesh.setColorAt(n, palette[e.kind])
      haloMesh.setColorAt(n, palette[e.kind])
      n += 1
    }
    coreMesh.count = n
    haloMesh.count = n
    coreMesh.instanceMatrix.needsUpdate = true
    haloMesh.instanceMatrix.needsUpdate = true
    if (coreMesh.instanceColor) coreMesh.instanceColor.needsUpdate = true
    if (haloMesh.instanceColor) haloMesh.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={core} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <octahedronGeometry args={[0.36, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={halo} args={[undefined, undefined, MAX]} frustumCulled={false}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshBasicMaterial
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </>
  )
}
