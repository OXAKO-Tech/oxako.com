'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dayState, mixColor } from './day-cycle'
import { createGlowTexture } from './textures'

// Stars are gone well before full day so the sky never looks cluttered in daylight
function nightAmount() {
  return 1 - THREE.MathUtils.smoothstep(dayState.value, 0.05, 0.55)
}

function StarLayer({ count, speed, phase, size }: { count: number; speed: number; phase: number; size: number }) {
  const material = useRef<THREE.PointsMaterial>(null)
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const azimuth = (Math.random() - 0.5) * 1.8
      const elevation = 0.12 + Math.random() * 0.4
      const flat = Math.sqrt(1 - elevation * elevation)
      array[i * 3] = Math.sin(azimuth) * flat * 100
      array[i * 3 + 1] = elevation * 100
      array[i * 3 + 2] = -Math.cos(azimuth) * flat * 100
    }
    return array
  }, [count])

  useFrame(({ clock }) => {
    if (material.current) {
      const twinkle = Math.sin(clock.elapsedTime * speed + phase) > -0.2 ? 1 : 0.4
      material.current.opacity = twinkle * nightAmount()
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        color="#cfd8e6"
        size={size}
        sizeAttenuation={false}
        transparent
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

export function Stars() {
  return (
    <group>
      <StarLayer count={34} size={2} speed={0.45} phase={0} />
      <StarLayer count={22} size={2} speed={0.8} phase={2} />
      <StarLayer count={9} size={3} speed={0.6} phase={4} />
    </group>
  )
}

export function ShootingStar() {
  const mesh = useRef<THREE.Mesh>(null)
  const state = useRef({ next: 4, start: 0, y: 16, x: 30, active: false })
  const duration = 0.9

  useFrame(({ clock }) => {
    const node = mesh.current
    if (!node) return
    const t = clock.elapsedTime
    const s = state.current

    if (!s.active && t >= s.next) {
      s.active = true
      s.start = t
      s.x = 20 + Math.random() * 20
      s.y = 12 + Math.random() * 12
    }
    if (!s.active) {
      node.visible = false
      return
    }

    const progress = (t - s.start) / duration
    if (progress >= 1) {
      s.active = false
      s.next = t + 6 + Math.random() * 6
      node.visible = false
      return
    }
    node.visible = true
    node.position.set(s.x - progress * 54, s.y - progress * 16, -70)
    ;(node.material as THREE.MeshBasicMaterial).opacity = Math.sin(Math.PI * progress) * nightAmount()
  })

  return (
    <mesh ref={mesh} visible={false} rotation={[0, 0, Math.atan2(16, 54)]}>
      <boxGeometry args={[5, 0.07, 0.07]} />
      <meshBasicMaterial color="#cfeefa" transparent fog={false} />
    </mesh>
  )
}

const FOG_COLORS = ['#4a5478', '#3b4568']
const FOG_DAY_COLORS = ['#9aabbd', '#8799ae']
const GROUND_FOG_NIGHT = new THREE.Color('#454d73')
const GROUND_FOG_DAY = new THREE.Color('#8798ac')
const scratch = new THREE.Color()

// One flat, translucent plane near the ground; terrain and rocks that rise through it get a hard fog line
export function GroundFog() {
  const material = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(() => {
    if (!material.current) return
    mixColor(material.current.color, GROUND_FOG_NIGHT, GROUND_FOG_DAY, dayState.value)
    material.current.opacity = 0.16 + 0.05 * dayState.value
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, -30]} renderOrder={1}>
      <planeGeometry args={[160, 120]} />
      <meshBasicMaterial ref={material} color="#454d73" transparent opacity={0.16} depthWrite={false} fog={false} />
    </mesh>
  )
}

export function FogBands() {
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(() => createGlowTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  const bands = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        position: [(i / 5) * 52 - 26, 0.5 + (i % 3) * 0.5, i === 4 ? 3 : -4 - i * 5] as [number, number, number],
        scale: [16 + (i % 3) * 3, 4.5, 1] as [number, number, number],
        speed: (0.25 + (i % 4) * 0.12) * (i % 2 === 0 ? 1 : 0.7),
        opacity: i === 4 ? 0.07 : 0.14 + (i % 3) * 0.04,
        color: FOG_COLORS[i % 2],
        dayColor: new THREE.Color(FOG_DAY_COLORS[i % 2]),
      })),
    [],
  )

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    group.current?.children.forEach((child, i) => {
      const band = bands[i]
      child.position.x += band.speed * dt
      if (child.position.x > 26) child.position.x = -26
      const material = (child as THREE.Sprite).material
      material.opacity = band.opacity * (0.8 + 0.2 * Math.sin(t * 0.4 + i))
      mixColor(material.color, scratch.set(FOG_COLORS[i % 2]), band.dayColor, dayState.value)
    })
  })

  return (
    <group ref={group}>
      {bands.map((band, i) => (
        <sprite key={i} position={band.position} scale={band.scale}>
          <spriteMaterial
            map={texture}
            color={band.color}
            opacity={band.opacity}
            transparent
            depthWrite={false}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  )
}

export function Dust({ count = 36 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22
      positions[i * 3 + 1] = Math.random() * 5.5
      positions[i * 3 + 2] = -8 + Math.random() * 14
      seeds[i] = Math.random()
    }
    return { positions, seeds }
  }, [count])

  useFrame(({ clock }, rawDelta) => {
    const geometry = points.current?.geometry
    if (!geometry) return
    const dt = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    const attribute = geometry.attributes.position as THREE.BufferAttribute
    const array = attribute.array as Float32Array
    for (let i = 0; i < count; i++) {
      const seed = seeds[i]
      array[i * 3] += dt * (0.35 + seed * 0.5)
      array[i * 3 + 1] += Math.sin(t * 0.7 + seed * 20) * dt * 0.12 + dt * 0.03
      if (array[i * 3] > 11) array[i * 3] = -11
      if (array[i * 3 + 1] > 5.5) array[i * 3 + 1] = 0.2
    }
    attribute.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#9fc3d6"
        size={2}
        sizeAttenuation={false}
        transparent
        opacity={0.5}
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}
