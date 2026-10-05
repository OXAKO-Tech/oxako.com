'use client'

import type { ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Alien } from './alien'
import { Dust, FogBands, GroundFog, ShootingStar, Stars } from './atmosphere'
import { CameraRig } from './camera-rig'
import { DayCycle } from './day-cycle'
import { Ground, Mountains, Rocks, Sky } from './terrain'
import { Tower } from './tower'
import { Workstation } from './workstation'

// Narrow screens shrink the desk setup so the alien and monitors stay in frame
function FitGroup({ children }: { children: ReactNode }) {
  const aspect = useThree((state) => state.size.width / state.size.height)
  const fit = THREE.MathUtils.clamp(aspect / 1.1, 0.72, 1)
  return <group scale={fit}>{children}</group>
}

interface HeroCanvasProps {
  animate: boolean
  running: boolean
  onReady: () => void
}

export default function HeroCanvas({ animate, running, onReady }: HeroCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={animate && running ? 'always' : 'demand'}
      camera={{ position: [0, 1.15, 7.2], fov: 40, near: 0.1, far: 300 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={onReady}
    >
      <DayCycle />

      <Sky />
      <Stars />
      <ShootingStar />
      <Mountains />
      <Ground />
      <Rocks />
      <Tower />
      <GroundFog />
      <FogBands />
      <Dust />
      <FitGroup>
        <Workstation />
        <Alien animate={animate} />
      </FitGroup>
      <CameraRig />
    </Canvas>
  )
}
