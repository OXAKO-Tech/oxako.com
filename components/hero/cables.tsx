'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Vec3 = [number, number, number]

interface CableSpec {
  points: Vec3[]
  radius: number
  pulses: number[]
}

const CABLES: CableSpec[] = [
  // left monitor to the PC, running behind the desk
  {
    points: [
      [-1.1, 1.3, -1.72],
      [-1.15, 1.0, -1.85],
      [-1.1, 0.4, -1.9],
      [-0.6, 0.05, -1.85],
      [0.6, 0.04, -1.75],
      [1.8, 0.05, -1.5],
      [2.15, 0.3, -1.2],
      [2.32, 0.55, -1.27],
    ],
    radius: 0.016,
    pulses: [0.1],
  },
  // right monitor to the PC
  {
    points: [
      [1.1, 1.3, -1.72],
      [1.4, 1.1, -1.8],
      [1.9, 0.9, -1.6],
      [2.2, 0.85, -1.35],
      [2.33, 0.75, -1.27],
    ],
    radius: 0.014,
    pulses: [0.5],
  },
  // PC to the piano, across the floor behind the chair
  {
    points: [
      [2.05, 0.2, -0.78],
      [1.7, 0.03, -0.5],
      [1.2, 0.04, -0.34],
      [0.3, 0.03, -0.42],
      [-0.6, 0.04, -0.4],
      [-1.3, 0.03, -0.45],
      [-1.7, 0.05, -0.6],
      [-1.95, 0.3, -0.8],
      [-2.1, 0.62, -0.78],
      [-2.16, 0.8, -0.73],
    ],
    radius: 0.02,
    pulses: [0.2, 0.7],
  },
]

const PULSE_SPEED = 0.12

export function Cables() {
  const built = useMemo(
    () =>
      CABLES.map((spec) => {
        const curve = new THREE.CatmullRomCurve3(spec.points.map((p) => new THREE.Vector3(...p)))
        const geometry = new THREE.TubeGeometry(curve, 48, spec.radius, 5, false)
        return { curve, geometry, pulses: spec.pulses }
      }),
    [],
  )
  const pulseDefs = useMemo(
    () => built.flatMap((cable, index) => cable.pulses.map((phase) => ({ index, phase }))),
    [built],
  )

  const wire = useMemo(() => new THREE.MeshLambertMaterial({ color: '#0b0f10', flatShading: true }), [])
  const spark = useMemo(() => new THREE.MeshBasicMaterial({ color: '#bff3ff', fog: false }), [])
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([])
  const scratch = useMemo(() => new THREE.Vector3(), [])

  useEffect(
    () => () => {
      built.forEach((cable) => cable.geometry.dispose())
      wire.dispose()
      spark.dispose()
    },
    [built, wire, spark],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    pulseDefs.forEach((def, i) => {
      const mesh = pulseRefs.current[i]
      if (!mesh) return
      built[def.index].curve.getPointAt((t * PULSE_SPEED + def.phase) % 1, scratch)
      mesh.position.copy(scratch)
    })
  })

  return (
    <group>
      {built.map((cable, i) => (
        <mesh key={i} geometry={cable.geometry} material={wire} />
      ))}
      {pulseDefs.map((def, i) => (
        <mesh
          key={i}
          ref={(node) => {
            pulseRefs.current[i] = node
          }}
          position={built[def.index].curve.getPointAt(def.phase)}
          material={spark}
        >
          <sphereGeometry args={[0.035, 6, 4]} />
        </mesh>
      ))}
    </group>
  )
}
