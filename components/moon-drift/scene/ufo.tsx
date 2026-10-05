'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, Group, LatheGeometry, Mesh, MeshBasicMaterial, Vector2 } from 'three'
import { CFG, type MoonDriftEngine } from '@/lib/moon-drift/engine'
import { createGlowTexture, WATER_Y } from './assets'

// Radius, height profile of the hull. Wide flat disc, shallow belly.
const HULL_PROFILE: [number, number][] = [
  [0, 0.12],
  [0.22, 0.14],
  [0.5, 0.11],
  [0.78, 0.05],
  [0.92, 0],
  [0.9, -0.05],
  [0.72, -0.1],
  [0.4, -0.14],
  [0, -0.15],
]

const BEADS = 8
const CYAN = new Color('#7dd3e8')
const EMBER = new Color('#e0894c')

interface UfoProps {
  engine: MoonDriftEngine
  reducedMotion: boolean
}

export function Ufo({ engine, reducedMotion }: UfoProps) {
  const root = useRef<Group>(null)
  const tilt = useRef<Group>(null)
  const beads = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)
  const underglow = useRef<Mesh>(null)
  const ring = useRef<MeshBasicMaterial>(null)
  const roll = useRef(0)
  const pitch = useRef(0)

  const hull = useMemo(
    () => new LatheGeometry(HULL_PROFILE.map(([r, y]) => new Vector2(r, y)), 32),
    [],
  )
  const glow = useMemo(() => createGlowTexture(), [])

  useEffect(
    () => () => {
      hull.dispose()
      glow.dispose()
    },
    [hull, glow],
  )

  useFrame((state, delta) => {
    const group = root.current
    const lean = tilt.current
    if (!group || !lean) return

    const bob = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 2.2) * 0.035
    group.position.set(engine.px, engine.py + bob, 0)

    const tiltScale = reducedMotion ? 0.4 : 1
    const rollTarget = (-engine.vx / CFG.maxSpeedX) * 0.42 * tiltScale
    const pitchTarget = (-engine.vy / CFG.maxSpeedY) * 0.14 * tiltScale
    const ease = 1 - Math.exp(-9 * delta)
    roll.current += (rollTarget - roll.current) * ease
    pitch.current += (pitchTarget - pitch.current) * ease
    lean.rotation.set(pitch.current, 0, roll.current)

    if (beads.current) beads.current.rotation.y += delta * 1.1

    // Blink while shields recover; reduced motion gets a steady colour change instead
    const recovering = engine.invuln > 0
    group.visible = reducedMotion || !recovering || Math.floor(state.clock.elapsedTime * 14) % 2 === 0
    ring.current?.color.copy(recovering ? EMBER : CYAN)

    // Fake shadow and light spill on the water, scaled by height for depth reading
    const height = Math.max(0.5, engine.py - WATER_Y)
    const spread = 1 + height * 0.35
    if (shadow.current) {
      shadow.current.position.set(engine.px, WATER_Y + 0.03, 0)
      shadow.current.scale.set(spread * 1.4, spread * 1.4, 1)
    }
    if (underglow.current) {
      underglow.current.position.set(engine.px, WATER_Y + 0.04, 0)
      underglow.current.scale.set(spread * 2, spread * 2, 1)
    }
  })

  return (
    <>
      <group ref={root} position={[0, CFG.yStart, 0]}>
        <group ref={tilt}>
          <mesh geometry={hull}>
            <meshStandardMaterial color="#2b303b" metalness={0.45} roughness={0.5} />
          </mesh>

          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.55]}>
            <torusGeometry args={[0.88, 0.055, 6, 40]} />
            <meshStandardMaterial color="#aab3c0" metalness={0.6} roughness={0.38} />
          </mesh>

          <mesh position={[0, 0.1, 0]} scale={[1, 0.8, 1]}>
            <sphereGeometry args={[0.4, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#56667c"
              metalness={0.25}
              roughness={0.28}
              emissive="#0a2530"
              emissiveIntensity={0.9}
            />
          </mesh>

          <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.66, 0.035, 6, 36]} />
            <meshBasicMaterial ref={ring} color="#7dd3e8" toneMapped={false} />
          </mesh>

          <group ref={beads} position={[0, 0.03, 0]}>
            {Array.from({ length: BEADS }, (_, i) => {
              const a = (i / BEADS) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(a) * 0.9, 0, Math.sin(a) * 0.9]}>
                  <sphereGeometry args={[0.04, 6, 5]} />
                  <meshBasicMaterial color="#9fe6f2" toneMapped={false} />
                </mesh>
              )
            })}
          </group>

          <mesh position={[0, -0.75, 0]}>
            <coneGeometry args={[0.6, 1.2, 20, 1, true]} />
            <meshBasicMaterial
              color="#7dd3e8"
              transparent
              opacity={0.07}
              depthWrite={false}
              side={2}
              blending={AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={glow} color="#000000" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh ref={underglow} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial
          map={glow}
          color="#4fb4cc"
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  )
}
