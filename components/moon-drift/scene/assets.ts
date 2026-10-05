import {
  BufferGeometry,
  CanvasTexture,
  Color,
  IcosahedronGeometry,
  LinearFilter,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const FOG_COLOR = '#202748'
export const WATER_Y = -1

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function canvas(width: number, height: number) {
  const el = document.createElement('canvas')
  el.width = width
  el.height = height
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return { el, ctx }
}

function finish(el: HTMLCanvasElement, pixelated = false) {
  const texture = new CanvasTexture(el)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = pixelated ? NearestFilter : LinearFilter
  texture.magFilter = pixelated ? NearestFilter : LinearFilter
  texture.generateMipmaps = false
  return texture
}

const DAY_FOG = new Color('#bcd6ee')
const SUNSET = new Color('#f0a070')
const NIGHT_HORIZON = new Color(FOG_COLOR)

// [offset, night colour, day colour] from the top of the sky down to the horizon band
const SKY_STOPS: [number, string, string][] = [
  [0, '#03050b', '#2f6fc9'],
  [0.18, '#080d1b', '#4a8fdc'],
  [0.32, '#141b38', '#7db4e8'],
  [0.42, '#1d2445', '#a9cdee'],
]

/** Horizon and fog colour for a time of day, warmed while the sun is rising or setting. */
export function horizonColor(day: number, target = new Color()) {
  const warmth = 1 - Math.abs(day * 2 - 1)
  return target.copy(NIGHT_HORIZON).lerp(DAY_FOG, day).lerp(SUNSET, warmth * 0.45)
}

/** Vertical sky gradient that can be repainted for any time of day (0 night, 1 day). */
export function createSky() {
  const { el, ctx } = canvas(4, 256)
  const texture = finish(el)
  const from = new Color()
  const to = new Color()
  const horizon = new Color()

  const paint = (day: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    for (const [offset, night, noon] of SKY_STOPS) {
      gradient.addColorStop(offset, from.set(night).lerp(to.set(noon), day).getStyle())
    }
    horizonColor(day, horizon)
    gradient.addColorStop(0.46, horizon.getStyle())
    gradient.addColorStop(1, horizon.getStyle())
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 4, 256)
    texture.needsUpdate = true
  }

  paint(0)
  return { texture, paint }
}

/** Low-resolution streaks that scroll to give the water a sense of speed. */
export function createWaterTexture(base = '#0a1322', streakRgb = '70, 102, 150', alphaScale = 1) {
  const { el, ctx } = canvas(128, 128)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, 128, 128)
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 46; i++) {
    const w = 10 + rand() * 54
    const x = rand() * 128
    const y = Math.floor(rand() * 128)
    ctx.fillStyle = `rgba(${streakRgb}, ${(0.08 + rand() * 0.2) * alphaScale})`
    ctx.fillRect(x, y, w, rand() < 0.3 ? 2 : 1)
    if (x + w > 128) ctx.fillRect(x - 128, y, w, 1)
  }
  const texture = finish(el, true)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  return texture
}

export function createMoonTexture() {
  const { el, ctx } = canvas(256, 256)
  ctx.fillStyle = '#d6dae6'
  ctx.fillRect(0, 0, 256, 256)
  let seed = 31
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `rgba(120, 130, 160, ${0.14 + rand() * 0.12})`
    ctx.beginPath()
    ctx.ellipse(rand() * 256, rand() * 256, 14 + rand() * 38, 10 + rand() * 28, rand() * 3, 0, 6.3)
    ctx.fill()
  }
  for (let i = 0; i < 26; i++) {
    const r = 3 + rand() * 11
    const x = rand() * 256
    const y = rand() * 256
    ctx.fillStyle = 'rgba(96, 106, 138, 0.28)'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 6.3)
    ctx.fill()
    ctx.fillStyle = 'rgba(244, 246, 252, 0.22)'
    ctx.beginPath()
    ctx.arc(x - r * 0.18, y - r * 0.18, r * 0.78, 0, 6.3)
    ctx.fill()
  }
  return finish(el, true)
}

/** Soft white radial falloff, tinted through material colour. */
export function createGlowTexture() {
  const { el, ctx } = canvas(128, 128)
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.35)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  return finish(el)
}

const hash = (x: number, y: number, z: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
  return n - Math.floor(n)
}

/** Lumpy but smooth-shaded debris: a welded icosphere with a stable radial wobble. */
export function createRockGeometry(): BufferGeometry {
  let geometry: BufferGeometry = new IcosahedronGeometry(1, 1)
  geometry.deleteAttribute('normal')
  geometry.deleteAttribute('uv')
  geometry = mergeVertices(geometry)
  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)
    const wobble = 0.8 + hash(x, y, z) * 0.38
    position.setXYZ(i, x * wobble, y * wobble, z * wobble)
  }
  geometry.computeVertexNormals()
  return geometry
}
