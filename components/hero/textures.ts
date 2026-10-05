import * as THREE from 'three'

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return { canvas, ctx: canvas.getContext('2d') as CanvasRenderingContext2D }
}

function createRandom(initial: number) {
  let seed = initial
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

// Keeps the chunky texel look up close, but blends between mip levels at a distance so nothing shimmers
function pixelate(texture: THREE.Texture) {
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.generateMipmaps = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function smooth(texture: THREE.Texture) {
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Soft white blob used for the alien's eye reflections
export function createSoftHighlightTexture() {
  const size = 64
  const { canvas, ctx } = createCanvas(size, size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.18)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return smooth(new THREE.CanvasTexture(canvas))
}

// Radial falloff with only a gentle quantisation so the light sprite keeps a little console character
export function createGlowTexture() {
  const size = 32
  const steps = 16
  const { canvas, ctx } = createCanvas(size, size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const image = ctx.getImageData(0, 0, size, size)
  for (let i = 3; i < image.data.length; i += 4) {
    image.data[i] = Math.round((image.data[i] / 255) * steps) * (255 / steps)
  }
  ctx.putImageData(image, 0, 0)

  return smooth(new THREE.CanvasTexture(canvas))
}

// The camera only sees a thin band around the horizon, so the hard colour bands are packed tightly around the equator
type SkyBands = [number, string][]

export const SKY_BANDS_NIGHT: SkyBands = [
  [0, '#04070f'],
  [0.3, '#060b16'],
  [0.38, '#0a1120'],
  [0.43, '#101a2e'],
  [0.46, '#18233d'],
  [0.48, '#232d4a'],
  [0.495, '#2c3350'],
  [0.515, '#1a2036'],
  [0.6, '#0a0d16'],
]

// Same band positions as night so the two skies crossfade cleanly; a soft, hazy slate-blue
export const SKY_BANDS_DAY: SkyBands = [
  [0, '#2f4560'],
  [0.3, '#3a526d'],
  [0.38, '#4b6580'],
  [0.43, '#5d778f'],
  [0.46, '#6f8aa2'],
  [0.48, '#8199ae'],
  [0.495, '#8fa6b8'],
  [0.515, '#6c8196'],
  [0.6, '#5a6e82'],
]

export function createSkyTexture(bands: SkyBands = SKY_BANDS_NIGHT) {
  const height = 128
  const { canvas, ctx } = createCanvas(1, height)
  for (let y = 0; y < height; y++) {
    const fraction = y / height
    let color = bands[0][1]
    for (const [start, value] of bands) {
      if (fraction >= start) color = value
    }
    ctx.fillStyle = color
    ctx.fillRect(0, y, 1, 1)
  }
  return smooth(new THREE.CanvasTexture(canvas))
}

// A broad, flat painted ground tile: coarse colour patches with hand-placed single-pixel cracks
export function createGroundTexture() {
  const size = 128
  const { canvas, ctx } = createCanvas(size, size)
  const random = createRandom(7)
  const palette = ['#56665f', '#5b6b63', '#4f5e58', '#617169']

  for (let y = 0; y < size; y += 8) {
    for (let x = 0; x < size; x += 8) {
      ctx.fillStyle = palette[Math.floor(random() * palette.length)]
      ctx.fillRect(x, y, 8, 8)
    }
  }
  ctx.fillStyle = '#48564f'
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(Math.floor(random() * 7) * 16, Math.floor(random() * 7) * 16, 16, 16)
  }

  ctx.fillStyle = '#20282a'
  const wrap = (value: number) => ((Math.round(value) % size) + size) % size
  for (let i = 0; i < 12; i++) {
    let x = random() * size
    let y = random() * size
    let angle = random() * Math.PI * 2
    const steps = 10 + Math.floor(random() * 10)
    for (let s = 0; s < steps; s++) {
      angle += (random() - 0.5) * 1.1
      x += Math.cos(angle) * 2
      y += Math.sin(angle) * 2
      ctx.fillRect(wrap(x), wrap(y), 1, 1)
    }
  }

  const texture = pixelate(new THREE.CanvasTexture(canvas))
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(16, 18)
  return texture
}
