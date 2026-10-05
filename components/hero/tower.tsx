'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { dayState } from './day-cycle'
import { createGlowTexture } from './textures'

type Vec3 = [number, number, number]
type BeamSpec = { from: Vec3; to: Vec3; size: number }

const LEG_HEIGHT = 8.2
const BOLT_POINTS = 9
const GLOW_POSITION: Vec3 = [-0.2, 9.5, 0]

function legHalfWidth(y: number) {
  return 1.4 - 1.05 * (y / LEG_HEIGHT)
}

function buildBeams(): BeamSpec[] {
  const beams: BeamSpec[] = []
  for (const z of [0.5, -0.5]) {
    beams.push({ from: [-1.4, 0, z], to: [-0.35, LEG_HEIGHT, z], size: 0.14 })
    beams.push({ from: [1.4, 0, z], to: [legHalfWidth(6.2), 6.2, z], size: 0.14 })

    const levels = [1.5, 3.2, 4.9]
    for (const y of levels) {
      beams.push({ from: [-legHalfWidth(y), y, z], to: [legHalfWidth(y), y, z], size: 0.08 })
    }
    for (let i = 0; i < levels.length - 1; i++) {
      const lower = levels[i]
      const upper = levels[i + 1]
      const flip = i % 2 === 0 ? 1 : -1
      beams.push({
        from: [-legHalfWidth(lower) * flip, lower, z],
        to: [legHalfWidth(upper) * flip, upper, z],
        size: 0.06,
      })
    }
  }
  beams.push({ from: [-0.5, 0, 0.5], to: [-0.5, 0, -0.5], size: 0.08 })
  beams.push({ from: [0.5, 0, 0.5], to: [0.5, 0, -0.5], size: 0.08 })
  beams.push({ from: [-0.35, LEG_HEIGHT, 0.5], to: [0.9, 9.3, 0.5], size: 0.1 })
  beams.push({ from: [0.9, 9.3, 0.5], to: [1.25, 8.1, 0.5], size: 0.07 })
  beams.push({ from: [-0.35, LEG_HEIGHT, -0.5], to: [-0.2, 9.5, 0], size: 0.08 })
  return beams
}

function Beam({ from, to, size, material }: BeamSpec & { material: THREE.Material }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const direction = b.clone().sub(a)
    return {
      length: direction.length(),
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
    }
  }, [from, to])

  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <boxGeometry args={[size * 1.7, length, size * 1.7]} />
    </mesh>
  )
}

function jag(attribute: THREE.BufferAttribute) {
  let x = 0
  for (let i = 0; i < BOLT_POINTS; i++) {
    x += (Math.random() - 0.5) * 0.6
    attribute.setXYZ(i, i === 0 ? 0 : x, (i / (BOLT_POINTS - 1)) * 3.6, 0)
  }
  attribute.needsUpdate = true
}

export function Tower() {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const x = Math.min(7.6, aspect * 10.6 * 0.62)

  const glowTexture = useMemo(() => createGlowTexture(), [])
  const beams = useMemo(buildBeams, [])
  const metal = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1b2528', flatShading: true }), [])
  const shardMaterial = useMemo(
    () =>
      new THREE.MeshLambertMaterial({ color: '#10181a', emissive: '#7dd3e8', emissiveIntensity: 0.25, flatShading: true }),
    [],
  )
  const bolt = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BOLT_POINTS * 3), 3))
    const material = new THREE.LineBasicMaterial({ color: '#bff3ff', transparent: true, opacity: 0.95, fog: false })
    const line = new THREE.Line(geometry, material)
    line.visible = false
    line.frustumCulled = false
    return line
  }, [])

  const shardCount = 6
  const shards = useMemo(
    () =>
      Array.from({ length: shardCount }, (_, i) => {
        const angle = (i / shardCount) * Math.PI * 2
        const radius = 2.2 + (i % 3) * 0.7
        return {
          position: [Math.cos(angle) * radius, ((i * 37) % 5 - 2) * 0.5, Math.sin(angle) * radius] as Vec3,
          size: 0.14 + (i % 4) * 0.06,
        }
      }),
    [],
  )

  const glow = useRef<THREE.Sprite>(null)
  const core = useRef<THREE.Sprite>(null)
  const light = useRef<THREE.PointLight>(null)
  const shardGroup = useRef<THREE.Group>(null)
  const fx = useRef({ nextBolt: 2.5, boltUntil: 0, lastJag: 0 })

  useEffect(
    () => () => {
      glowTexture.dispose()
      metal.dispose()
      shardMaterial.dispose()
      bolt.geometry.dispose()
      ;(bolt.material as THREE.Material).dispose()
    },
    [glowTexture, metal, shardMaterial, bolt],
  )

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    const s = fx.current

    if (t >= s.nextBolt) {
      s.boltUntil = t + 0.22 + Math.random() * 0.18
      s.nextBolt = t + 1.4 + Math.random() * 3.2
    }
    const striking = t < s.boltUntil
    if (striking && t - s.lastJag > 0.045) {
      jag(bolt.geometry.attributes.position as THREE.BufferAttribute)
      s.lastJag = t
    }
    bolt.visible = striking

    const pulse = 0.8 + 0.2 * Math.sin(t * 2.3) + 0.08 * Math.sin(t * 17)
    const boost = striking ? 1.5 : 1
    // The tower's energy glow eases back in daylight but never disappears
    const daylight = 1 - 0.5 * dayState.value
    if (glow.current) {
      const size = 9 * pulse * (striking ? 1.25 : 1)
      glow.current.scale.set(size, size, 1)
      glow.current.material.opacity = Math.min(1, 0.55 * pulse * boost * daylight)
    }
    if (core.current) {
      const size = 2.4 * pulse * boost
      core.current.scale.set(size, size, 1)
    }
    if (light.current) light.current.intensity = 220 * pulse * (striking ? 2.2 : 1) * daylight

    const group = shardGroup.current
    if (group) {
      group.rotation.y = t * 0.2
      group.children.forEach((child, i) => {
        child.rotation.x += dt * (0.4 + i * 0.07)
        child.rotation.y += dt * 0.3
        child.position.y = shards[i].position[1] + Math.sin(t * 0.8 + i) * 0.25
      })
    }
  })

  return (
    <group position={[x, -0.2, -22]} rotation={[0, 0, 0.1]} scale={0.62}>
      {beams.map((beam, i) => (
        <Beam key={i} {...beam} material={metal} />
      ))}

      <group position={GLOW_POSITION}>
        <sprite ref={glow}>
          <spriteMaterial
            map={glowTexture}
            color="#7dd3e8"
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
        <sprite ref={core}>
          <spriteMaterial
            map={glowTexture}
            color="#e8fbff"
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
        <pointLight ref={light} color="#7dd3e8" distance={60} decay={2} />
        <primitive object={bolt} />
      </group>

      <group ref={shardGroup} position={[-0.2, 7.2, 0]}>
        {shards.map((shard, i) => (
          <mesh key={i} position={shard.position} scale={shard.size} material={shardMaterial}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
