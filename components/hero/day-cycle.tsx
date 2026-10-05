'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// 0 = full night, 1 = full (muted) day. Written once per frame by DayCycle, read by the scenery.
export const dayState = { value: 0 }

// Half the cycle is the slow rise into day, half the slow fall back into night
const CYCLE_SECONDS = 60

export function dayAt(elapsed: number) {
  const wave = 0.5 - 0.5 * Math.cos((elapsed / CYCLE_SECONDS) * Math.PI * 2)
  // The smoothstep lingers a little at each end so night and day each get a moment to settle
  return THREE.MathUtils.smoothstep(wave, 0.12, 0.88)
}

export function mixColor(target: THREE.Color, night: THREE.Color, day: THREE.Color, amount: number) {
  return target.copy(night).lerp(day, amount)
}

const NIGHT = {
  background: new THREE.Color('#0a0d16'),
  fog: new THREE.Color('#2c3350'),
  ambient: new THREE.Color('#6f7fa0'),
  key: new THREE.Color('#b4c6da'),
  rim: new THREE.Color('#7dd3e8'),
}

// Overcast and dusty rather than sunny, so the scene never gets glaring
const DAY = {
  background: new THREE.Color('#5a6e82'),
  fog: new THREE.Color('#7f93a8'),
  ambient: new THREE.Color('#98a9bd'),
  key: new THREE.Color('#e2ddd0'),
  rim: new THREE.Color('#a9c4d0'),
}

export function DayCycle() {
  const scene = useThree((state) => state.scene)
  const time = useRef(0)
  const ambient = useRef<THREE.AmbientLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const rim = useRef<THREE.DirectionalLight>(null)

  useFrame((_, rawDelta) => {
    // Accumulated (and clamped) so a paused tab resumes where it left off instead of jumping
    time.current += Math.min(rawDelta, 0.1)
    const d = dayAt(time.current)
    dayState.value = d

    if (scene.background instanceof THREE.Color) mixColor(scene.background, NIGHT.background, DAY.background, d)
    if (scene.fog) mixColor(scene.fog.color, NIGHT.fog, DAY.fog, d)

    if (ambient.current) {
      mixColor(ambient.current.color, NIGHT.ambient, DAY.ambient, d)
      ambient.current.intensity = THREE.MathUtils.lerp(0.9, 1.05, d)
    }
    if (key.current) {
      mixColor(key.current.color, NIGHT.key, DAY.key, d)
      key.current.intensity = THREE.MathUtils.lerp(1.6, 1.75, d)
    }
    if (rim.current) {
      mixColor(rim.current.color, NIGHT.rim, DAY.rim, d)
      rim.current.intensity = THREE.MathUtils.lerp(0.6, 0.3, d)
    }
  })

  return (
    <>
      <color attach="background" args={['#0a0d16']} />
      <fog attach="fog" args={['#2c3350', 14, 120]} />
      <ambientLight ref={ambient} intensity={0.9} color="#6f7fa0" />
      <directionalLight ref={key} position={[-4, 6, 5]} intensity={1.6} color="#b4c6da" />
      <directionalLight ref={rim} position={[6, 3, -4]} intensity={0.6} color="#7dd3e8" />
    </>
  )
}
