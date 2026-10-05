'use client'

import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Vec3 = [number, number, number]

const SCREEN_IMAGES = {
  daw: '/images/screen-daw.webp',
  design: '/images/screen-design.webp',
} as const

// The screen plane is wider than the 4:3 source, so crop a little off the top and bottom instead of stretching
const SCREEN_ASPECT = 0.8 / 0.56
const SOURCE_ASPECT = 4 / 3
const VISIBLE_HEIGHT = SOURCE_ASPECT / SCREEN_ASPECT

interface CrtMonitorProps {
  position: Vec3
  rotationY: number
  kind: keyof typeof SCREEN_IMAGES
  seed: number
}

export function CrtMonitor({ position, rotationY, kind, seed }: CrtMonitorProps) {
  const texture = useMemo(() => {
    const loaded = new THREE.TextureLoader().load(SCREEN_IMAGES[kind])
    loaded.colorSpace = THREE.SRGBColorSpace
    loaded.anisotropy = 4
    loaded.repeat.set(1, VISIBLE_HEIGHT)
    loaded.offset.set(0, (1 - VISIBLE_HEIGHT) / 2)
    return loaded
  }, [kind])
  const baseColor = useMemo(() => new THREE.Color('#e4eeee'), [])
  const screen = useMemo(
    () => new THREE.MeshBasicMaterial({ map: texture, color: baseColor, toneMapped: false, fog: false }),
    [texture, baseColor],
  )
  const shell = useMemo(() => new THREE.MeshLambertMaterial({ color: '#262e31', flatShading: true }), [])
  const trim = useMemo(() => new THREE.MeshLambertMaterial({ color: '#101517', flatShading: true }), [])
  const led = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7dd3e8', fog: false }), [])

  useEffect(
    () => () => {
      texture.dispose()
      screen.dispose()
      shell.dispose()
      trim.dispose()
      led.dispose()
    },
    [texture, screen, shell, trim, led],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const dip = Math.sin(t * 0.9 + seed) > 0.985 ? -0.3 : 0
    const flicker = 0.88 + 0.06 * Math.sin(t * 37 + seed) + 0.04 * Math.sin(t * 5.3 + seed * 2) + dip
    screen.color.copy(baseColor).multiplyScalar(flicker)
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh material={shell}>
        <boxGeometry args={[1, 0.76, 0.12]} />
      </mesh>
      <mesh position={[0, 0.02, 0.061]} material={trim}>
        <boxGeometry args={[0.88, 0.64, 0.01]} />
      </mesh>
      <mesh position={[0, 0.02, 0.068]} material={screen}>
        <planeGeometry args={[0.8, 0.56]} />
      </mesh>
      <mesh position={[0, 0, -0.31]} material={shell}>
        <boxGeometry args={[0.76, 0.58, 0.5]} />
      </mesh>
      <mesh position={[0, 0, -0.66]} material={shell}>
        <boxGeometry args={[0.46, 0.38, 0.2]} />
      </mesh>
      <mesh position={[0, -0.41, 0]} material={trim}>
        <boxGeometry args={[0.5, 0.06, 0.45]} />
      </mesh>
      <mesh position={[0.38, -0.32, 0.062]} material={led}>
        <boxGeometry args={[0.03, 0.015, 0.01]} />
      </mesh>
    </group>
  )
}
