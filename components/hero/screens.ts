import * as THREE from 'three'

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function createFloorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#161d20'
  ctx.fillRect(0, 0, 128, 128)

  const rand = seeded(5)
  for (let i = 0; i < 220; i++) {
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.12)'
    ctx.fillRect(Math.floor(rand() * 128), Math.floor(rand() * 128), 2, 2)
  }
  ctx.strokeStyle = '#0a1012'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, 125, 125)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(6, 3.4)
  texture.anisotropy = 4
  return texture
}
