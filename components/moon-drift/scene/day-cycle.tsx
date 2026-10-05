'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type DirectionalLight, type Fog, type HemisphereLight } from 'three'
import type { MoonDriftEngine } from '@/lib/moon-drift/engine'
import { createSky, FOG_COLOR, horizonColor } from './assets'

const NIGHT_FOG_FAR = 150
const DAY_FOG_FAR = 175

const HEMI = {
  skyNight: new Color('#8ea2cf'),
  skyDay: new Color('#dcecff'),
  groundNight: new Color('#1a2236'),
  groundDay: new Color('#7d93a8'),
  intensityNight: 1.1,
  intensityDay: 1.5,
}

const KEY = {
  colorNight: new Color('#b8c8ff'),
  colorDay: new Color('#fff0d2'),
  intensityNight: 1.6,
  intensityDay: 2.4,
}

const FILL = {
  colorNight: new Color('#9fb2d8'),
  colorDay: new Color('#cfe0ff'),
  intensityNight: 0.55,
  intensityDay: 0.8,
}

/** Owns everything that changes with the time of day: sky, fog and scene lighting. */
export function DayCycle({ engine }: { engine: MoonDriftEngine }) {
  const sky = useMemo(() => createSky(), [])
  const horizon = useMemo(() => new Color(), [])
  const fog = useRef<Fog>(null)
  const hemisphere = useRef<HemisphereLight>(null)
  const key = useRef<DirectionalLight>(null)
  const fill = useRef<DirectionalLight>(null)
  const lastDay = useRef(-1)

  useEffect(() => () => sky.texture.dispose(), [sky])

  useFrame(() => {
    const day = engine.daylight
    // Repainting the sky uploads a texture, so skip frames where the light has not visibly changed
    if (Math.abs(day - lastDay.current) < 0.004) return
    lastDay.current = day

    sky.paint(day)
    horizonColor(day, horizon)

    if (fog.current) {
      fog.current.color.copy(horizon)
      fog.current.far = NIGHT_FOG_FAR + (DAY_FOG_FAR - NIGHT_FOG_FAR) * day
    }
    if (hemisphere.current) {
      hemisphere.current.color.lerpColors(HEMI.skyNight, HEMI.skyDay, day)
      hemisphere.current.groundColor.lerpColors(HEMI.groundNight, HEMI.groundDay, day)
      hemisphere.current.intensity = HEMI.intensityNight + (HEMI.intensityDay - HEMI.intensityNight) * day
    }
    if (key.current) {
      key.current.color.lerpColors(KEY.colorNight, KEY.colorDay, day)
      key.current.intensity = KEY.intensityNight + (KEY.intensityDay - KEY.intensityNight) * day
    }
    if (fill.current) {
      fill.current.color.lerpColors(FILL.colorNight, FILL.colorDay, day)
      fill.current.intensity = FILL.intensityNight + (FILL.intensityDay - FILL.intensityNight) * day
    }
  })

  return (
    <>
      <primitive object={sky.texture} attach="background" />
      <fog ref={fog} attach="fog" args={[FOG_COLOR, 35, NIGHT_FOG_FAR]} />
      <hemisphereLight ref={hemisphere} args={['#8ea2cf', '#1a2236', 1.1]} />
      <directionalLight ref={key} position={[-14, 16, -12]} color="#b8c8ff" intensity={1.6} />
      <directionalLight ref={fill} position={[6, 10, 14]} color="#9fb2d8" intensity={0.55} />
    </>
  )
}
