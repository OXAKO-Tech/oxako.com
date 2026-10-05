'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Vec3 = [number, number, number]

const WHITE_COUNT = 15
const KEY_W = 0.088
const BLACK_AFTER = [0, 1, 3, 4, 5]
const PRESS_ANGLE = 0.08
const BODY_Y = 0.8
const STAND_ANGLE = 0.62

interface KeySpec {
  x: number
  black: boolean
}

function buildKeys(): KeySpec[] {
  const keys: KeySpec[] = []
  const offset = (WHITE_COUNT - 1) / 2
  for (let i = 0; i < WHITE_COUNT; i++) keys.push({ x: (i - offset) * KEY_W, black: false })
  for (let i = 0; i < WHITE_COUNT - 1; i++) {
    if (BLACK_AFTER.includes(i % 7)) keys.push({ x: (i - offset) * KEY_W + KEY_W / 2, black: true })
  }
  return keys
}

interface PianoProps {
  position: Vec3
  rotationY: number
}

// A slim electric keyboard on an X-stand that plays itself while wired into the machine
export function Piano({ position, rotationY }: PianoProps) {
  const keys = useMemo(buildKeys, [])
  const keyRefs = useRef<(THREE.Group | null)[]>([])
  const led = useRef<THREE.Mesh>(null)
  const play = useRef({ next: 2.2, until: new Array<number>(keys.length).fill(0) })

  const shell = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1c2325', flatShading: true }), [])
  const panel = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2a3437', flatShading: true }), [])
  const stand = useMemo(() => new THREE.MeshLambertMaterial({ color: '#151b1d', flatShading: true }), [])
  const whiteKey = useMemo(() => new THREE.MeshLambertMaterial({ color: '#c3ccc9', flatShading: true }), [])
  const blackKey = useMemo(() => new THREE.MeshLambertMaterial({ color: '#0a0d0e', flatShading: true }), [])
  const ledMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7dd3e8', fog: false }), [])
  const display = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2c7f8f', fog: false }), [])

  useEffect(
    () => () => {
      shell.dispose()
      panel.dispose()
      stand.dispose()
      whiteKey.dispose()
      blackKey.dispose()
      ledMaterial.dispose()
      display.dispose()
    },
    [shell, panel, stand, whiteKey, blackKey, ledMaterial, display],
  )

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    const state = play.current

    if (t >= state.next) {
      const presses = Math.random() > 0.7 ? 2 : 1
      for (let n = 0; n < presses; n++) {
        const index = Math.floor(Math.random() * keys.length)
        state.until[index] = t + 0.2 + Math.random() * 0.25
      }
      state.next = t + 0.5 + Math.random() * 1.5
    }

    keyRefs.current.forEach((key, i) => {
      if (!key) return
      const target = t < state.until[i] ? PRESS_ANGLE : 0
      key.rotation.x = THREE.MathUtils.damp(key.rotation.x, target, 30, dt)
    })

    if (led.current) led.current.visible = Math.sin(t * 2.1) > -0.2
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-0.09, 0.09].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, STAND_ANGLE]} material={stand}>
            <boxGeometry args={[0.035, 0.96, 0.035]} />
          </mesh>
          <mesh position={[0, 0.38, 0]} rotation={[0, 0, -STAND_ANGLE]} material={stand}>
            <boxGeometry args={[0.035, 0.96, 0.035]} />
          </mesh>
          <mesh position={[0, 0.76, 0]} material={stand}>
            <boxGeometry args={[0.9, 0.03, 0.04]} />
          </mesh>
        </group>
      ))}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.02, 0]} material={stand}>
          <boxGeometry args={[0.04, 0.03, 0.34]} />
        </mesh>
      ))}

      <mesh position={[0, BODY_Y, 0]} material={shell}>
        <boxGeometry args={[1.42, 0.08, 0.34]} />
      </mesh>
      <mesh position={[0, BODY_Y + 0.055, -0.1]} material={panel}>
        <boxGeometry args={[1.42, 0.03, 0.14]} />
      </mesh>
      <mesh position={[-0.5, BODY_Y + 0.073, -0.1]} material={display}>
        <boxGeometry args={[0.16, 0.006, 0.07]} />
      </mesh>
      {[-0.22, -0.1, 0.02, 0.14, 0.26].map((x) => (
        <mesh key={x} position={[x, BODY_Y + 0.078, -0.1]} material={shell}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 6]} />
        </mesh>
      ))}

      {keys.map((key, i) => (
        <group
          key={i}
          ref={(node) => {
            keyRefs.current[i] = node
          }}
          position={[key.x, BODY_Y + 0.044, -0.03]}
        >
          {key.black ? (
            <mesh position={[0, 0.02, 0.07]} material={blackKey}>
              <boxGeometry args={[0.05, 0.03, 0.12]} />
            </mesh>
          ) : (
            <mesh position={[0, 0, 0.1]} material={whiteKey}>
              <boxGeometry args={[KEY_W * 0.92, 0.022, 0.2]} />
            </mesh>
          )}
        </group>
      ))}

      <mesh ref={led} position={[0.62, BODY_Y + 0.073, -0.1]} material={ledMaterial}>
        <boxGeometry args={[0.04, 0.008, 0.02]} />
      </mesh>

      <mesh position={[0.5, BODY_Y, -0.18]} material={shell}>
        <boxGeometry args={[0.1, 0.05, 0.03]} />
      </mesh>
    </group>
  )
}
