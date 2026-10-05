'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Object3D, type InstancedMesh } from 'three'
import type { MoonDriftEngine } from '@/lib/moon-drift/engine'
import { smoothstep, WATER_Y } from './assets'

const LOOP = 140
const BEHIND = 25
const PALETTE = ['#33463f', '#2b3f4a', '#3a4a45', '#2a3a3a', '#34404f']

interface Island {
  offset: number
  x: number
  width: number
  height: number
  color: string
  light: string | null
}

function buildIslands(): Island[] {
  let s = 91
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const islands: Island[] = []
  const count = 20
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1
    islands.push({
      offset: (i / count) * LOOP + rand() * 4,
      x: side * (10 + rand() * 18),
      width: 2 + rand() * 3.2,
      height: 1.4 + rand() * 4.4,
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
      light: i % 4 === 1 ? (rand() < 0.5 ? '#e0894c' : '#e6c070') : null,
    })
  }
  return islands
}

export function Scenery({ engine }: { engine: MoonDriftEngine }) {
  const islands = useMemo(buildIslands, [])
  const lit = useMemo(() => islands.filter((island) => island.light), [islands])
  const bodies = useRef<InstancedMesh>(null)
  const lights = useRef<InstancedMesh>(null)
  const dummy = useMemo(() => new Object3D(), [])

  useLayoutEffect(() => {
    const color = new Color()
    islands.forEach((island, i) => bodies.current?.setColorAt(i, color.set(island.color)))
    lit.forEach((island, i) => lights.current?.setColorAt(i, color.set(island.light ?? '#ffffff')))
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true
    if (lights.current?.instanceColor) lights.current.instanceColor.needsUpdate = true
  }, [islands, lit])

  useFrame(() => {
    const body = bodies.current
    const lamp = lights.current
    if (!body || !lamp) return

    let lampIndex = 0
    islands.forEach((island, i) => {
      const dz = ((((island.offset - engine.travel) % LOOP) + LOOP) % LOOP) - BEHIND
      const grow = smoothstep(LOOP - BEHIND, LOOP - BEHIND - 18, dz)
      const h = island.height * grow

      dummy.position.set(island.x, WATER_Y - 0.25 + h / 2, -dz)
      dummy.rotation.set(0, i * 0.9, 0)
      dummy.scale.set(island.width, Math.max(h, 0.001), island.width * 0.9)
      dummy.updateMatrix()
      body.setMatrixAt(i, dummy.matrix)

      if (island.light) {
        dummy.position.set(island.x + island.width * 0.15, WATER_Y - 0.25 + h + 0.2, -dz)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(grow)
        dummy.updateMatrix()
        lamp.setMatrixAt(lampIndex, dummy.matrix)
        lampIndex += 1
      }
    })
    body.instanceMatrix.needsUpdate = true
    lamp.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={bodies} args={[undefined, undefined, islands.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.55, 1, 1, 7, 1]} />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={lights} args={[undefined, undefined, lit.length]} frustumCulled={false}>
        <sphereGeometry args={[0.16, 6, 5]} />
        <meshBasicMaterial />
      </instancedMesh>
    </>
  )
}
