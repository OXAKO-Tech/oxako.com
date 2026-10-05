'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dayState, mixColor } from './day-cycle'
import { createGroundTexture, createSkyTexture, SKY_BANDS_DAY, SKY_BANDS_NIGHT } from './textures'

function hash(x: number, z: number) {
  const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return h - Math.floor(h)
}

function terrainHeight(x: number, z: number) {
  const rolling = Math.sin(x * 0.22) * Math.cos(z * 0.19) * 0.9 + Math.sin(x * 0.7 + z * 0.5) * 0.22
  const flat = THREE.MathUtils.smoothstep(Math.hypot(x, z), 3, 10)
  return (rolling + hash(x, z) * 0.14) * flat
}

export function Sky() {
  const nightTexture = useMemo(() => createSkyTexture(SKY_BANDS_NIGHT), [])
  const dayTexture = useMemo(() => createSkyTexture(SKY_BANDS_DAY), [])
  const nightMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: nightTexture, side: THREE.BackSide, fog: false, depthWrite: false }),
    [nightTexture],
  )
  // Drawn over the night sky and faded in, so the change is a slow crossfade rather than a swap
  const dayMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: dayTexture,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      }),
    [dayTexture],
  )
  const dayMesh = useRef<THREE.Mesh>(null)

  useFrame(() => {
    dayMaterial.opacity = dayState.value
    if (dayMesh.current) dayMesh.current.visible = dayState.value > 0.002
  })

  useEffect(
    () => () => {
      nightTexture.dispose()
      dayTexture.dispose()
      nightMaterial.dispose()
      dayMaterial.dispose()
    },
    [nightTexture, dayTexture, nightMaterial, dayMaterial],
  )

  return (
    <group>
      <mesh renderOrder={-2} material={nightMaterial}>
        <sphereGeometry args={[150, 16, 12]} />
      </mesh>
      <mesh ref={dayMesh} renderOrder={-1} material={dayMaterial} visible={false}>
        <sphereGeometry args={[149, 16, 12]} />
      </mesh>
    </group>
  )
}

const GROUND_CENTER_Z = -35
const GROUND_NIGHT = new THREE.Color('#c4d0d6')
const GROUND_DAY = new THREE.Color('#d4dad6')

export function Ground() {
  const texture = useMemo(() => createGroundTexture(), [])
  const material = useMemo(
    () => new THREE.MeshLambertMaterial({ color: '#c4d0d6', map: texture, flatShading: true }),
    [texture],
  )
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(90, 100, 30, 36)
    plane.rotateX(-Math.PI / 2)
    const position = plane.attributes.position
    for (let i = 0; i < position.count; i++) {
      position.setY(i, terrainHeight(position.getX(i), position.getZ(i) + GROUND_CENTER_Z))
    }
    plane.computeVertexNormals()
    return plane
  }, [])

  useFrame(() => {
    mixColor(material.color, GROUND_NIGHT, GROUND_DAY, dayState.value)
  })

  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
      geometry.dispose()
    },
    [texture, material, geometry],
  )

  return <mesh geometry={geometry} material={material} position={[0, 0, GROUND_CENTER_Z]} />
}

function createRidge(width: number, peak: number, steps: number, seed: number) {
  const positions: number[] = []
  const indices: number[] = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps - 0.5) * width
    const wave = 0.55 + 0.3 * Math.sin(i * 0.9 + seed) + 0.15 * Math.sin(i * 2.3 + seed * 2)
    const height = Math.max(0.12, wave * 0.7 + hash(i, seed) * 0.35) * peak
    positions.push(x, height, 0, x, -4, 0)
    if (i > 0) {
      const a = (i - 1) * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  return geometry
}

// Further layers are taller and lighter; the linear fog does the rest of the depth work
const RIDGES = [
  { z: -58, peak: 9, steps: 22, seed: 1, color: '#131a24', dayColor: '#3a4a5c' },
  { z: -76, peak: 12, steps: 18, seed: 4, color: '#1a2230', dayColor: '#4b5d72' },
  { z: -96, peak: 15, steps: 14, seed: 9, color: '#232b3f', dayColor: '#62768c' },
]

export function Mountains() {
  const layers = useMemo(
    () =>
      RIDGES.map((ridge) => ({
        z: ridge.z,
        geometry: createRidge(220, ridge.peak, ridge.steps, ridge.seed),
        material: new THREE.MeshBasicMaterial({ color: ridge.color, side: THREE.DoubleSide }),
        night: new THREE.Color(ridge.color),
        day: new THREE.Color(ridge.dayColor),
      })),
    [],
  )

  useFrame(() => {
    layers.forEach((layer) => mixColor(layer.material.color, layer.night, layer.day, dayState.value))
  })

  useEffect(
    () => () => {
      layers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
    },
    [layers],
  )

  return (
    <group>
      {layers.map((layer) => (
        <mesh key={layer.z} geometry={layer.geometry} material={layer.material} position={[0, 0, layer.z]} />
      ))}
    </group>
  )
}

const ROCK_NIGHT = new THREE.Color('#232c2e')
const ROCK_DAY = new THREE.Color('#333d3f')

export function Rocks({ count = 10 }: { count?: number }) {
  const material = useMemo(() => new THREE.MeshLambertMaterial({ color: '#232c2e', flatShading: true }), [])
  useEffect(() => () => material.dispose(), [material])
  useFrame(() => {
    mixColor(material.color, ROCK_NIGHT, ROCK_DAY, dayState.value)
  })

  const rocks = useMemo(() => {
    let seed = 11
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    const items: { position: [number, number, number]; rotation: [number, number, number]; size: number }[] = []
    while (items.length < count) {
      const rawX = (random() - 0.5) * 16
      const z = -4 + random() * 7
      if (Math.abs(rawX) < 1 && Math.abs(z) < 1.2) continue
      // Rocks that would land on the office floor tile sit just beside it instead
      const onFloorTile = Math.abs(rawX) < 3.6 && z > -2.4 && z < 1.6
      const x = onFloorTile ? Math.sign(rawX || 1) * (3.8 + Math.abs(rawX) * 0.3) : rawX
      items.push({
        position: [x, terrainHeight(x, z) + 0.04, z],
        rotation: [random() * 3, random() * 3, random() * 3],
        size: 0.12 + random() * 0.28,
      })
    }
    return items
  }, [count])

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.position} rotation={rock.rotation} scale={rock.size} material={material}>
          <dodecahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  )
}
