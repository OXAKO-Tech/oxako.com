'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from './camera-rig'
import { OfficeChair } from './office-chair'
import { createSoftHighlightTexture } from './textures'

type Action = 'idle' | 'wave' | 'look' | 'fix'

const CYCLE: Action[] = ['wave', 'look', 'look', 'fix', 'look', 'wave', 'look', 'fix', 'look', 'look']
const WAVE_DURATION = 3.4
const LOOK_DURATION = 6.2
const FIX_DURATION = 8.6

// The chair rests turned toward the piano while his head keeps facing the viewer
const SEAT_YAW = -0.5
const HEAD_COUNTER = -SEAT_YAW * 0.85
const SIT_ROOT_Y = -0.425
const SIT_LEAN = -0.1
const SIT_ARM = -0.5
const STAND_STEP_Z = 0.42

// [time, yaw, pitch] - glance toward the tower, then the other way, then back to the viewer
const LOOK_KEYS: [number, number, number][] = [
  [0, 0, 0],
  [0.9, 0.75, -0.12],
  [2.4, 0.75, -0.12],
  [3.3, -0.7, -0.05],
  [4.9, -0.7, -0.05],
  [5.9, 0, 0],
]

function sampleLook(t: number): [number, number] {
  const first = LOOK_KEYS[0]
  if (t <= first[0]) return [first[1], first[2]]
  for (let i = 1; i < LOOK_KEYS.length; i++) {
    const b = LOOK_KEYS[i]
    if (t < b[0]) {
      const a = LOOK_KEYS[i - 1]
      const k = (t - a[0]) / (b[0] - a[0])
      const eased = k * k * (3 - 2 * k)
      return [a[1] + (b[1] - a[1]) * eased, a[2] + (b[2] - a[2]) * eased]
    }
  }
  const last = LOOK_KEYS[LOOK_KEYS.length - 1]
  return [last[1], last[2]]
}

const POSE = {
  STAND: 0,
  X: 1,
  YAW: 2,
  LEAN: 3,
  REACH: 4,
  CHAIR_YAW: 5,
  CHAIR_LIFT: 6,
  CHAIR_Z: 7,
  HEAD_YAW: 8,
  HEAD_PITCH: 9,
} as const
const POSE_SIZE = 10

// [time, stand, x, yaw, lean, reach, chairYaw, chairLift, chairZ, headYaw, headPitch]
// He pushes up, steps beside the chair, drags and spins it into place, glances at the viewer, then sits again.
const FIX_KEYS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0.9, 1, 0, 0, 0.05, 0, 0.2, 0, -0.15, 0, 0.1],
  [1.8, 1, 0.85, -1.45, 0.08, 0, 0.2, 0, -0.15, 0, 0.2],
  [2.8, 1, 0.85, -1.45, 0.32, 1, 0.2, 0, 0.05, 0, 0.35],
  [3.6, 1, 0.85, -1.45, 0.32, 1, 0.95, 0.06, 0.4, 0, 0.35],
  [4.6, 1, 0.85, -1.45, 0.32, 1, -0.3, 0.1, 0.4, 0, 0.35],
  [5.4, 1, 0.85, -1.45, 0.14, 0.4, 0, 0.02, 0.15, 0.15, 0.18],
  [6.2, 1, 0.85, -1.45, 0.05, 0, 0, 0, 0, 0.9, 0.05],
  [7.3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
const ZERO_POSE: number[] = new Array(POSE_SIZE).fill(0)

function sampleFix(t: number, out: number[]) {
  const last = FIX_KEYS[FIX_KEYS.length - 1]
  if (t >= last[0]) {
    for (let i = 0; i < POSE_SIZE; i++) out[i] = last[i + 1]
    return out
  }
  for (let k = 1; k < FIX_KEYS.length; k++) {
    const b = FIX_KEYS[k]
    if (t < b[0]) {
      const a = FIX_KEYS[k - 1]
      const f = (t - a[0]) / (b[0] - a[0])
      const eased = f * f * (3 - 2 * f)
      for (let i = 0; i < POSE_SIZE; i++) out[i] = a[i + 1] + (b[i + 1] - a[i + 1]) * eased
      return out
    }
  }
  return out
}

interface ArmProps {
  x: number
  shoulderRef: RefObject<THREE.Group | null>
  elbowRef: RefObject<THREE.Group | null>
  material: THREE.Material
}

function Arm({ x, shoulderRef, elbowRef, material }: ArmProps) {
  return (
    <group ref={shoulderRef} position={[x, 1.57, 0]} rotation={[SIT_ARM, 0, 0]}>
      <mesh position={[0, -0.19, 0]} material={material}>
        <cylinderGeometry args={[0.04, 0.035, 0.38, 5]} />
      </mesh>
      <group ref={elbowRef} position={[0, -0.38, 0]} rotation={[SIT_ARM, 0, 0]}>
        <mesh position={[0, -0.18, 0]} material={material}>
          <cylinderGeometry args={[0.035, 0.03, 0.36, 5]} />
        </mesh>
        <mesh position={[0, -0.4, 0]} material={material}>
          <icosahedronGeometry args={[0.058, 0]} />
        </mesh>
      </group>
    </group>
  )
}

interface LegProps {
  x: number
  hipRef: RefObject<THREE.Group | null>
  kneeRef: RefObject<THREE.Group | null>
  material: THREE.Material
}

function Leg({ x, hipRef, kneeRef, material }: LegProps) {
  return (
    <group ref={hipRef} position={[x, 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, -0.25, 0]} material={material}>
        <cylinderGeometry args={[0.06, 0.0525, 0.5, 5]} />
      </mesh>
      <group ref={kneeRef} position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, -0.25, 0]} material={material}>
          <cylinderGeometry args={[0.0525, 0.045, 0.5, 5]} />
        </mesh>
        <mesh position={[0, -0.46, 0.06]} material={material}>
          <boxGeometry args={[0.13, 0.08, 0.26]} />
        </mesh>
      </group>
    </group>
  )
}

interface EyeProps {
  x: number
  tilt: number
  groupRef: RefObject<THREE.Group | null>
  glass: THREE.Material
  primaryHighlight: THREE.Material
  secondaryHighlight: THREE.Material
}

// A smooth dark glass lens with two soft white reflections that share the eye's blink
function Eye({ x, tilt, groupRef, glass, primaryHighlight, secondaryHighlight }: EyeProps) {
  return (
    <group ref={groupRef} position={[x, 0.38, 0.335]} rotation={[0, 0, tilt]}>
      <mesh scale={[1.45, 1.12, 0.6]} material={glass}>
        <sphereGeometry args={[0.115, 28, 20]} />
      </mesh>
      <mesh position={[-0.055, 0.045, 0.074]} scale={[0.075, 0.075, 1]} material={primaryHighlight}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh position={[0.052, -0.04, 0.07]} scale={[0.032, 0.032, 1]} material={secondaryHighlight}>
        <planeGeometry args={[1, 1]} />
      </mesh>
    </group>
  )
}

export function Alien({ animate }: { animate: boolean }) {
  const rig = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const upper = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const head = useRef<THREE.Group>(null)
  const eyeLeft = useRef<THREE.Group>(null)
  const eyeRight = useRef<THREE.Group>(null)
  const waveShoulder = useRef<THREE.Group>(null)
  const waveElbow = useRef<THREE.Group>(null)
  const restShoulder = useRef<THREE.Group>(null)
  const restElbow = useRef<THREE.Group>(null)
  const hipLeft = useRef<THREE.Group>(null)
  const hipRight = useRef<THREE.Group>(null)
  const kneeLeft = useRef<THREE.Group>(null)
  const kneeRight = useRef<THREE.Group>(null)
  const chair = useRef<THREE.Group>(null)
  const seat = useRef<THREE.Group>(null)

  const brain = useRef({
    action: 'idle' as Action,
    start: 0,
    next: 1.6,
    index: 0,
    wave: 0,
    pose: new Array<number>(POSE_SIZE).fill(0),
    target: new Array<number>(POSE_SIZE).fill(0),
  })

  const skin = useMemo(() => new THREE.MeshLambertMaterial({ color: '#76867a', flatShading: true }), [])
  const mouthMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#16201f' }), [])
  const eyeGlass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#020304',
        roughness: 0.2,
        metalness: 0,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
        specularIntensity: 0.6,
      }),
    [],
  )
  const highlightTexture = useMemo(() => createSoftHighlightTexture(), [])
  const primaryHighlight = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: highlightTexture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [highlightTexture],
  )
  const secondaryHighlight = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: highlightTexture,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    [highlightTexture],
  )

  useEffect(() => {
    return () => {
      skin.dispose()
      mouthMaterial.dispose()
      eyeGlass.dispose()
      primaryHighlight.dispose()
      secondaryHighlight.dispose()
      highlightTexture.dispose()
    }
  }, [skin, mouthMaterial, eyeGlass, primaryHighlight, secondaryHighlight, highlightTexture])

  useFrame(({ clock }, rawDelta) => {
    if (!animate) return
    const dt = Math.min(rawDelta, 0.05)
    const t = clock.elapsedTime
    const s = brain.current
    const damp = THREE.MathUtils.damp

    if (s.action === 'idle') {
      if (t >= s.next) {
        s.action = CYCLE[s.index % CYCLE.length]
        s.index += 1
        s.start = t
      }
    } else {
      const duration = s.action === 'wave' ? WAVE_DURATION : s.action === 'fix' ? FIX_DURATION : LOOK_DURATION
      if (t - s.start >= duration) {
        s.action = 'idle'
        s.next = t + 3.5 + (s.index % 3) * 1.2
      }
    }
    const local = t - s.start
    const fixing = s.action === 'fix'

    const target = fixing ? sampleFix(local, s.target) : ZERO_POSE
    const pose = s.pose
    for (let i = 0; i < POSE_SIZE; i++) pose[i] = damp(pose[i], target[i], 10, dt)
    const stand = pose[POSE.STAND]

    let yaw = pointer.x * 0.3 + Math.sin(t * 0.37) * 0.1 + Math.sin(t * 0.91 + 1) * 0.04
    let pitch = -pointer.y * 0.15 + Math.sin(t * 0.29) * 0.03
    let tilt = Math.sin(t * 0.5) * 0.03
    if (s.action === 'look') {
      ;[yaw, pitch] = sampleLook(local)
    } else if (s.action === 'wave') {
      yaw = 0
      pitch = Math.sin(local * 2.4) * 0.06
      tilt = 0.14
    } else if (fixing) {
      yaw = pose[POSE.HEAD_YAW]
      pitch = pose[POSE.HEAD_PITCH]
    }

    yaw += HEAD_COUNTER * (1 - stand)

    s.wave = damp(s.wave, s.action === 'wave' ? 1 : 0, 4.5, dt)

    const headNode = head.current
    if (headNode) {
      headNode.rotation.y = damp(headNode.rotation.y, yaw, 5, dt)
      headNode.rotation.x = damp(headNode.rotation.x, pitch, 5, dt)
      headNode.rotation.z = damp(headNode.rotation.z, tilt, 5, dt)
    }

    const chairNode = chair.current
    if (chairNode) {
      const swivel = (yaw - HEAD_COUNTER * (1 - stand)) * 0.25 * (1 - stand)
      chairNode.rotation.y = damp(chairNode.rotation.y, SEAT_YAW + pose[POSE.CHAIR_YAW] + swivel, 6, dt)
      chairNode.position.z = pose[POSE.CHAIR_Z]
    }
    if (seat.current) seat.current.position.y = pose[POSE.CHAIR_LIFT]

    const rigNode = rig.current
    if (rigNode) {
      const seatedYaw = chairNode ? chairNode.rotation.y : 0
      rigNode.rotation.y = seatedYaw * (1 - stand) + pose[POSE.YAW] * stand
      rigNode.position.set(pose[POSE.X], 0.02, STAND_STEP_Z * stand)
    }

    const bend = (Math.PI / 2) * (1 - stand)
    if (hipLeft.current) hipLeft.current.rotation.x = -bend
    if (hipRight.current) hipRight.current.rotation.x = -bend
    if (kneeLeft.current) kneeLeft.current.rotation.x = bend
    if (kneeRight.current) kneeRight.current.rotation.x = bend

    const rootNode = root.current
    if (rootNode) {
      rootNode.position.y = 0.425 * (Math.cos(bend) + 1) - 0.85 + Math.sin(t * 1.6) * 0.01
      rootNode.rotation.z = damp(rootNode.rotation.z, s.wave * 0.025, 3, dt)
    }
    if (upper.current) upper.current.rotation.x = SIT_LEAN * (1 - stand) + pose[POSE.LEAN]
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 1.6) * 0.015

    const seated = 1 - stand
    const reach = pose[POSE.REACH]
    if (waveShoulder.current) {
      waveShoulder.current.rotation.z = -0.09 - s.wave * 2.35 + (1 - s.wave) * Math.sin(t * 1.3 + 1) * 0.02
      waveShoulder.current.rotation.x = SIT_ARM * seated * (1 - s.wave)
    }
    if (waveElbow.current) {
      waveElbow.current.rotation.z = s.wave * (-0.25 + Math.sin(t * 11) * 0.5)
      waveElbow.current.rotation.x = SIT_ARM * seated * (1 - s.wave)
    }
    if (restShoulder.current) {
      restShoulder.current.rotation.z = 0.09 + Math.sin(t * 1.2) * 0.02
      restShoulder.current.rotation.x = SIT_ARM * seated - 1.25 * reach
    }
    if (restElbow.current) {
      restElbow.current.rotation.z = 0.04
      restElbow.current.rotation.x = SIT_ARM * seated - 0.3 * reach + Math.sin(t * 6) * 0.1 * reach
    }

    const phase = t % 3.7
    const closed = phase < 0.14 ? 1 - Math.abs(phase - 0.07) / 0.07 : 0
    const eyeScaleY = 1 - 0.9 * closed
    if (eyeLeft.current) eyeLeft.current.scale.y = eyeScaleY
    if (eyeRight.current) eyeRight.current.scale.y = eyeScaleY
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0.1]} scale={[2, 1.5, 1]}>
        <circleGeometry args={[0.42, 10]} />
        <meshBasicMaterial color="#04060a" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <OfficeChair groupRef={chair} seatRef={seat} yaw={SEAT_YAW} />

      <group ref={rig} position={[0, 0.02, 0]} rotation={[0, SEAT_YAW, 0]}>
        <group ref={root} position={[0, SIT_ROOT_Y, 0]} scale={0.85}>
          <Leg x={-0.1} hipRef={hipLeft} kneeRef={kneeLeft} material={skin} />
          <Leg x={0.1} hipRef={hipRight} kneeRef={kneeRight} material={skin} />
          <mesh position={[0, 1.02, 0]} material={skin}>
            <cylinderGeometry args={[0.15, 0.13, 0.14, 6]} />
          </mesh>

          <group ref={upper} position={[0, 1, 0]} rotation={[SIT_LEAN, 0, 0]}>
            <group position={[0, -1, 0]}>
              <mesh ref={torso} position={[0, 1.34, 0]} material={skin}>
                <cylinderGeometry args={[0.2, 0.13, 0.62, 6]} />
              </mesh>
              <mesh position={[0, 1.72, 0]} material={skin}>
                <cylinderGeometry args={[0.045, 0.055, 0.18, 5]} />
              </mesh>

              <Arm x={-0.23} shoulderRef={waveShoulder} elbowRef={waveElbow} material={skin} />
              <Arm x={0.23} shoulderRef={restShoulder} elbowRef={restElbow} material={skin} />

              <group ref={head} position={[0, 1.8, 0]} rotation={[0, HEAD_COUNTER, 0]}>
                <mesh position={[0, 0.4, 0]} scale={[1, 1.08, 0.95]} material={skin}>
                  <icosahedronGeometry args={[0.42, 0]} />
                </mesh>
                <Eye
                  x={0.17}
                  tilt={0.1}
                  groupRef={eyeLeft}
                  glass={eyeGlass}
                  primaryHighlight={primaryHighlight}
                  secondaryHighlight={secondaryHighlight}
                />
                <Eye
                  x={-0.17}
                  tilt={-0.1}
                  groupRef={eyeRight}
                  glass={eyeGlass}
                  primaryHighlight={primaryHighlight}
                  secondaryHighlight={secondaryHighlight}
                />
                <mesh position={[0, 0.2, 0.358]} material={mouthMaterial}>
                  <boxGeometry args={[0.08, 0.012, 0.01]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  )
}
