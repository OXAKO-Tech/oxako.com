'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Cables } from './cables'
import { CrtMonitor } from './crt-monitor'
import { Piano } from './piano'
import { createFloorTexture } from './screens'

type Vec3 = [number, number, number]

const DESK_TOP = 0.955

function PcTower({ position, rotationY }: { position: Vec3; rotationY: number }) {
  const body = useMemo(() => new THREE.MeshLambertMaterial({ color: '#20282b', flatShading: true }), [])
  const panel = useMemo(() => new THREE.MeshLambertMaterial({ color: '#0e1315', flatShading: true }), [])
  const power = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7dd3e8', fog: false }), [])
  const disk = useMemo(() => new THREE.MeshBasicMaterial({ color: '#e0a458', fog: false }), [])
  const diskLed = useRef<THREE.Mesh>(null)

  useEffect(
    () => () => {
      body.dispose()
      panel.dispose()
      power.dispose()
      disk.dispose()
    },
    [body, panel, power, disk],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (diskLed.current) diskLed.current.visible = Math.sin(t * 23) + Math.sin(t * 7.3) > 0.7
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.47, 0]} material={body}>
        <boxGeometry args={[0.42, 0.9, 0.55]} />
      </mesh>
      <mesh position={[0, 0.7, 0.28]} material={panel}>
        <boxGeometry args={[0.34, 0.08, 0.02]} />
      </mesh>
      <mesh position={[0, 0.56, 0.28]} material={panel}>
        <boxGeometry args={[0.34, 0.08, 0.02]} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.28 - i * 0.045, 0.28]} material={panel}>
          <boxGeometry args={[0.3, 0.012, 0.02]} />
        </mesh>
      ))}
      <mesh position={[-0.12, 0.84, 0.28]} material={power}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
      </mesh>
      <mesh ref={diskLed} position={[-0.06, 0.84, 0.28]} material={disk}>
        <boxGeometry args={[0.03, 0.03, 0.01]} />
      </mesh>
    </group>
  )
}

function DeskLamp({ position }: { position: Vec3 }) {
  const metal = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1a2123', flatShading: true }), [])
  const bulb = useMemo(() => new THREE.MeshBasicMaterial({ color: '#e0a458', fog: false }), [])
  const light = useRef<THREE.PointLight>(null)

  useEffect(
    () => () => {
      metal.dispose()
      bulb.dispose()
    },
    [metal, bulb],
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const dip = Math.sin(t * 1.7) > 0.97 ? 0.4 : 1
    if (light.current) light.current.intensity = 3 * (0.88 + 0.08 * Math.sin(t * 3.1)) * dip
  })

  return (
    <group position={position}>
      <mesh position={[0, 0.015, 0]} material={metal}>
        <cylinderGeometry args={[0.11, 0.12, 0.03, 8]} />
      </mesh>
      <group position={[0, 0.03, 0]} rotation={[0, 0, -0.35]}>
        <mesh position={[0, 0.2, 0]} material={metal}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 5]} />
        </mesh>
        <group position={[0, 0.4, 0]} rotation={[0, 0, 0.95]}>
          <mesh position={[0, 0.17, 0]} material={metal}>
            <cylinderGeometry args={[0.012, 0.012, 0.34, 5]} />
          </mesh>
          <group position={[0, 0.34, 0]} rotation={[0, 0, 0.9]}>
            <mesh position={[0, 0.05, 0]} material={metal}>
              <coneGeometry args={[0.07, 0.12, 8, 1, true]} />
            </mesh>
            <mesh position={[0, 0.0, 0]} material={bulb}>
              <sphereGeometry args={[0.025, 6, 4]} />
            </mesh>
          </group>
        </group>
      </group>
      <pointLight ref={light} position={[-0.25, 0.55, 0.05]} color="#e0a458" intensity={3} distance={4} decay={2} />
    </group>
  )
}

export function Workstation() {
  const floorTexture = useMemo(() => createFloorTexture(), [])
  const floor = useMemo(() => new THREE.MeshLambertMaterial({ map: floorTexture }), [floorTexture])
  const steel = useMemo(() => new THREE.MeshLambertMaterial({ color: '#232b2e', flatShading: true }), [])
  const deskTop = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a3235', flatShading: true }), [])

  useEffect(
    () => () => {
      floorTexture.dispose()
      floor.dispose()
      steel.dispose()
      deskTop.dispose()
    },
    [floorTexture, floor, steel, deskTop],
  )

  return (
    <group>
      <mesh position={[0, -0.04, -0.4]} material={floor}>
        <boxGeometry args={[5.8, 0.12, 3.2]} />
      </mesh>

      <mesh position={[0, DESK_TOP - 0.035, -1]} material={deskTop}>
        <boxGeometry args={[3.2, 0.07, 0.9]} />
      </mesh>
      <mesh position={[-1.55, 0.47, -1]} material={steel}>
        <boxGeometry args={[0.06, 0.9, 0.85]} />
      </mesh>
      <mesh position={[1.3, 0.45, -1]} material={steel}>
        <boxGeometry args={[0.55, 0.86, 0.8]} />
      </mesh>
      {[0.62, 0.42, 0.22].map((y) => (
        <mesh key={y} position={[1.3, y, -0.595]} material={deskTop}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
        </mesh>
      ))}

      <CrtMonitor position={[-0.95, DESK_TOP + 0.44, -1.1]} rotationY={0.28} kind="daw" seed={1} />
      <CrtMonitor position={[0.95, DESK_TOP + 0.44, -1.1]} rotationY={-0.28} kind="design" seed={4} />

      <PcTower position={[2.25, 0, -1]} rotationY={-0.35} />
      <Piano position={[-2.45, 0.02, -0.3]} rotationY={0.7} />
      <DeskLamp position={[1.35, DESK_TOP, -1.3]} />
      <Cables />

      <pointLight position={[0, 1.4, 0.9]} color="#7dd3e8" intensity={3} distance={6} decay={2} />
      <pointLight position={[-1.5, 1.5, 1.2]} color="#7dd3e8" intensity={4.5} distance={5} decay={2} />
    </group>
  )
}
