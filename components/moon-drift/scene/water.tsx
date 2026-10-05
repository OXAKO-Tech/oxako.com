'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'
import type { MoonDriftEngine } from '@/lib/moon-drift/engine'
import { createWaterTexture, WATER_Y } from './assets'

const LENGTH = 300
const WIDTH = 180
const REPEAT_X = 14
const REPEAT_Y = 24
const TILE = LENGTH / REPEAT_Y

function useScrollingTexture(factory: () => ReturnType<typeof createWaterTexture>) {
  const texture = useMemo(() => {
    const map = factory()
    map.repeat.set(REPEAT_X, REPEAT_Y)
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/** Two stacked water sheets: the night one is always drawn, the daylight one fades in over it. */
export function Water({ engine }: { engine: MoonDriftEngine }) {
  const night = useScrollingTexture(() => createWaterTexture())
  const day = useScrollingTexture(() => createWaterTexture('#3a86b4', '205, 236, 250', 1.4))
  const dayMesh = useRef<Mesh>(null)
  const dayMaterial = useRef<MeshBasicMaterial>(null)

  useFrame(() => {
    const offset = (engine.travel / TILE) % 1
    night.offset.y = offset
    day.offset.y = offset

    const amount = engine.daylight
    if (dayMaterial.current) dayMaterial.current.opacity = amount
    if (dayMesh.current) dayMesh.current.visible = amount > 0.003
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, -90]}>
        <planeGeometry args={[WIDTH, LENGTH]} />
        <meshBasicMaterial map={night} />
      </mesh>
      <mesh ref={dayMesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y + 0.02, -90]} visible={false}>
        <planeGeometry args={[WIDTH, LENGTH]} />
        <meshBasicMaterial
          ref={dayMaterial}
          map={day}
          transparent
          opacity={0}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-4}
        />
      </mesh>
    </>
  )
}
