'use client'

import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'

const SPOKES = [0, 1, 2, 3, 4]

interface OfficeChairProps {
  groupRef: RefObject<THREE.Group | null>
  seatRef: RefObject<THREE.Group | null>
  yaw: number
}

// The base and column stay put; everything in seatRef rides the gas lift
export function OfficeChair({ groupRef, seatRef, yaw }: OfficeChairProps) {
  const frame = useMemo(() => new THREE.MeshLambertMaterial({ color: '#14191b', flatShading: true }), [])
  const fabric = useMemo(() => new THREE.MeshLambertMaterial({ color: '#273134', flatShading: true }), [])

  useEffect(
    () => () => {
      frame.dispose()
      fabric.dispose()
    },
    [frame, fabric],
  )

  return (
    <group ref={groupRef} position={[0, 0.02, 0]} rotation={[0, yaw, 0]}>
      {SPOKES.map((i) => (
        <group key={i} rotation={[0, (i / SPOKES.length) * Math.PI * 2, 0]}>
          <mesh position={[0.16, 0.09, 0]} material={frame}>
            <boxGeometry args={[0.32, 0.03, 0.05]} />
          </mesh>
          <mesh position={[0.32, 0.045, 0]} material={frame}>
            <sphereGeometry args={[0.035, 6, 4]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.19, 0]} material={frame}>
        <cylinderGeometry args={[0.028, 0.028, 0.24, 6]} />
      </mesh>

      <group ref={seatRef}>
        <mesh position={[0, 0.27, 0]} material={frame}>
          <cylinderGeometry args={[0.042, 0.042, 0.12, 6]} />
        </mesh>
        <mesh position={[0, 0.35, 0]} material={fabric}>
          <boxGeometry args={[0.52, 0.07, 0.5]} />
        </mesh>
        <mesh position={[0, 0.52, -0.27]} material={frame}>
          <boxGeometry args={[0.06, 0.3, 0.04]} />
        </mesh>
        <mesh position={[0, 0.72, -0.3]} rotation={[-0.12, 0, 0]} material={fabric}>
          <boxGeometry args={[0.46, 0.4, 0.07]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.29, 0.5, -0.05]} material={frame}>
              <boxGeometry args={[0.04, 0.2, 0.04]} />
            </mesh>
            <mesh position={[side * 0.29, 0.6, 0.02]} material={frame}>
              <boxGeometry args={[0.07, 0.03, 0.3]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
