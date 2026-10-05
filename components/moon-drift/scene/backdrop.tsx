'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PointsMaterial,
} from 'three'
import type { MoonDriftEngine } from '@/lib/moon-drift/engine'
import { createGlowTexture, createMoonTexture, WATER_Y } from './assets'

const MOON_POSITION: [number, number, number] = [-30, 24, -140]
const SUN_POSITION: [number, number, number] = [34, 24, -140]
const MOON_SINK = 16
const SUN_RISE = 30

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function createRidgeGeometry(seed: number, minHeight: number, maxHeight: number) {
  const rand = seeded(seed)
  const shape = new Shape()
  const left = -260
  const right = 260
  shape.moveTo(left, WATER_Y - 2)
  let x = left
  let height = minHeight + rand() * (maxHeight - minHeight)
  shape.lineTo(x, WATER_Y + height)
  while (x < right) {
    x += 14 + rand() * 26
    // Alternate peaks and saddles so the silhouette reads as separate mountains
    height = rand() < 0.45 ? minHeight * (0.3 + rand() * 0.5) : minHeight + rand() * (maxHeight - minHeight)
    shape.lineTo(x, WATER_Y + height)
  }
  shape.lineTo(x, WATER_Y - 2)
  shape.closePath()
  return new ShapeGeometry(shape)
}

function createStarGeometry(count: number) {
  const rand = seeded(11)
  const positions: number[] = []
  for (let i = 0; i < count; i++) {
    positions.push((rand() - 0.5) * 340, 14 + rand() * 90, -170)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  return geometry
}

const RIDGES = [
  { z: -125, night: new Color('#2a3257'), day: new Color('#6d8fb8'), min: 5, max: 15, seed: 5 },
  { z: -105, night: new Color('#1b2142'), day: new Color('#5778a0'), min: 3, max: 11, seed: 17 },
  { z: -88, night: new Color('#10152c'), day: new Color('#41607f'), min: 1.5, max: 6, seed: 29 },
]

const FAR_LIGHTS: { x: number; y: number; z: number; color: string }[] = [
  { x: -46, y: -0.2, z: -88, color: '#e0894c' },
  { x: -12, y: 0.1, z: -88, color: '#e6c070' },
  { x: 27, y: -0.1, z: -88, color: '#e0894c' },
  { x: 58, y: 0.2, z: -88, color: '#e6c070' },
  { x: -70, y: 0.3, z: -105, color: '#e0894c' },
]

function smooth(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function Backdrop({ engine }: { engine: MoonDriftEngine }) {
  const moon = useMemo(() => createMoonTexture(), [])
  const glow = useMemo(() => createGlowTexture(), [])
  const ridges = useMemo(
    () => RIDGES.map((ridge) => createRidgeGeometry(ridge.seed, ridge.min, ridge.max)),
    [],
  )
  const stars = useMemo(() => createStarGeometry(150), [])

  const starsMaterial = useRef<PointsMaterial>(null)
  const moonBody = useRef<Mesh>(null)
  const moonGlow = useRef<Mesh>(null)
  const moonBodyMaterial = useRef<MeshBasicMaterial>(null)
  const moonGlowMaterial = useRef<MeshBasicMaterial>(null)
  const sunBody = useRef<Mesh>(null)
  const sunGlow = useRef<Mesh>(null)
  const sunBodyMaterial = useRef<MeshBasicMaterial>(null)
  const sunGlowMaterial = useRef<MeshBasicMaterial>(null)
  const ridgeMaterials = useRef<(MeshBasicMaterial | null)[]>([])
  const farLights = useRef<Group>(null)

  useEffect(
    () => () => {
      moon.dispose()
      glow.dispose()
      ridges.forEach((geometry) => geometry.dispose())
      stars.dispose()
    },
    [moon, glow, ridges, stars],
  )

  useFrame(() => {
    const day = engine.daylight
    const night = 1 - day
    const sunUp = smooth(0.05, 0.45, day)

    if (starsMaterial.current) starsMaterial.current.opacity = 0.55 * smooth(0, 0.8, night)

    const moonY = MOON_POSITION[1] - day * MOON_SINK
    moonBody.current?.position.setY(moonY)
    moonGlow.current?.position.setY(moonY)
    if (moonBodyMaterial.current) moonBodyMaterial.current.opacity = smooth(0.05, 0.85, night)
    if (moonGlowMaterial.current) moonGlowMaterial.current.opacity = 0.32 * smooth(0.1, 0.9, night)

    const sunY = SUN_POSITION[1] - SUN_RISE + day * SUN_RISE
    sunBody.current?.position.setY(sunY)
    sunGlow.current?.position.setY(sunY)
    if (sunBodyMaterial.current) sunBodyMaterial.current.opacity = sunUp
    if (sunGlowMaterial.current) sunGlowMaterial.current.opacity = 0.55 * sunUp

    ridgeMaterials.current.forEach((material, i) => {
      material?.color.lerpColors(RIDGES[i].night, RIDGES[i].day, day)
    })
    if (farLights.current) farLights.current.visible = day < 0.5
  })

  return (
    <>
      <points geometry={stars} frustumCulled={false}>
        <pointsMaterial
          ref={starsMaterial}
          color="#cfd6ea"
          size={1.6}
          sizeAttenuation={false}
          transparent
          opacity={0.55}
          fog={false}
        />
      </points>

      <mesh ref={moonGlow} position={[MOON_POSITION[0], MOON_POSITION[1], MOON_POSITION[2] - 2]}>
        <planeGeometry args={[88, 88]} />
        <meshBasicMaterial
          ref={moonGlowMaterial}
          map={glow}
          color="#6f86b8"
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={AdditiveBlending}
          fog={false}
        />
      </mesh>
      <mesh ref={moonBody} position={MOON_POSITION}>
        <sphereGeometry args={[15, 28, 20]} />
        <meshBasicMaterial ref={moonBodyMaterial} map={moon} color="#e6e8f0" transparent fog={false} />
      </mesh>

      <mesh ref={sunGlow} position={[SUN_POSITION[0], SUN_POSITION[1] - SUN_RISE, SUN_POSITION[2] - 2]}>
        <planeGeometry args={[130, 130]} />
        <meshBasicMaterial
          ref={sunGlowMaterial}
          map={glow}
          color="#ffc47a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          fog={false}
        />
      </mesh>
      <mesh ref={sunBody} position={[SUN_POSITION[0], SUN_POSITION[1] - SUN_RISE, SUN_POSITION[2]]}>
        <sphereGeometry args={[9, 24, 16]} />
        <meshBasicMaterial ref={sunBodyMaterial} color="#fff3c9" transparent opacity={0} fog={false} />
      </mesh>

      {RIDGES.map((ridge, i) => (
        <mesh key={ridge.z} geometry={ridges[i]} position={[0, 0, ridge.z]}>
          <meshBasicMaterial
            ref={(material) => {
              ridgeMaterials.current[i] = material
            }}
            color={ridge.night}
            fog={false}
          />
        </mesh>
      ))}

      <group ref={farLights}>
        {FAR_LIGHTS.map((light) => (
          <mesh key={`${light.x}-${light.z}`} position={[light.x, light.y, light.z + 0.5]}>
            <sphereGeometry args={[0.35, 6, 5]} />
            <meshBasicMaterial color={light.color} fog={false} />
          </mesh>
        ))}
      </group>
    </>
  )
}
