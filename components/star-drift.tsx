'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelButton } from '@/components/pixel-button'
import { cn } from '@/lib/utils'

const WIDTH = 360
const HEIGHT = 480
const RUN_SECONDS = 40
const MAX_LIVES = 3
const PLAYER_WIDTH = 44
const PLAYER_HEIGHT = 26
const PLAYER_Y = HEIGHT - 58
const KEY_SPEED = 270
const DRAG_SPEED = 640
const BEST_KEY = 'oxako-star-drift-best'

const COLORS = {
  sky: '#070a12',
  skyLow: '#172235',
  fog: '#615c92',
  hills: '#506b9b',
  ground: '#526a57',
  groundDark: '#3b4f40',
  cyan: '#7dd3e8',
  gold: '#d6b56c',
  ember: '#d98a5b',
  lavender: '#b39dd8',
  debris: '#2a3140',
  debrisEdge: '#65707a',
  text: '#f1eee6',
  muted: '#a9b2c3',
}

type Kind = 'star' | 'bonus' | 'surge' | 'debris'
type Phase = 'idle' | 'playing' | 'paused' | 'over'

type Item = { kind: Kind; x: number; y: number; r: number; vy: number; spin: number }

type GameState = {
  playerX: number
  items: Item[]
  score: number
  lives: number
  elapsed: number
  spawnTimer: number
  surgeUntil: number
  invulnerableUntil: number
  flash: number
}

const POINTS: Record<Exclude<Kind, 'debris'>, number> = { star: 10, bonus: 30, surge: 15 }

// Fixed background stars so every frame draws the same sky.
const backgroundStars = Array.from({ length: 36 }, (_, i) => ({
  x: (i * 97 + 31) % WIDTH,
  y: (i * 61 + 17) % (HEIGHT - 150),
  size: i % 5 === 0 ? 2 : 1,
}))

function createState(): GameState {
  return {
    playerX: WIDTH / 2,
    items: [],
    score: 0,
    lives: MAX_LIVES,
    elapsed: 0,
    spawnTimer: 0.5,
    surgeUntil: 0,
    invulnerableUntil: 0,
    flash: 0,
  }
}

function polygon(ctx: CanvasRenderingContext2D, points: number[][], fill: string, stroke?: string) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function drawScene(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, COLORS.sky)
  sky.addColorStop(0.7, COLORS.skyLow)
  sky.addColorStop(1, COLORS.fog)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = COLORS.text
  ctx.globalAlpha = 0.5
  for (const star of backgroundStars) ctx.fillRect(star.x, star.y, star.size, star.size)
  ctx.globalAlpha = 1

  // Distant low-poly hills
  polygon(ctx, [[0, 380], [60, 330], [120, 365], [190, 310], [250, 352], [310, 320], [360, 355], [360, 440], [0, 440]], COLORS.hills)
  ctx.globalAlpha = 0.35
  polygon(ctx, [[0, 395], [80, 360], [150, 390], [230, 350], [300, 385], [360, 365], [360, 440], [0, 440]], COLORS.fog)
  ctx.globalAlpha = 1

  // Grounded terrain
  polygon(ctx, [[0, 424], [70, 410], [140, 428], [220, 408], [290, 426], [360, 412], [360, HEIGHT], [0, HEIGHT]], COLORS.ground)
  polygon(ctx, [[0, 452], [90, 440], [180, 456], [270, 438], [360, 454], [360, HEIGHT], [0, HEIGHT]], COLORS.groundDark)

  // Distant warm light
  ctx.fillStyle = COLORS.ember
  ctx.fillRect(250, 340, 3, 3)
}

function drawItem(ctx: CanvasRenderingContext2D, item: Item) {
  ctx.save()
  ctx.translate(item.x, item.y)
  ctx.rotate(item.spin)
  const r = item.r
  if (item.kind === 'star') {
    polygon(ctx, [[0, -r], [r * 0.4, -r * 0.4], [r, 0], [r * 0.4, r * 0.4], [0, r], [-r * 0.4, r * 0.4], [-r, 0], [-r * 0.4, -r * 0.4]], COLORS.cyan)
  } else if (item.kind === 'bonus') {
    polygon(ctx, [[0, -r], [r * 0.9, -r * 0.5], [r * 0.9, r * 0.5], [0, r], [-r * 0.9, r * 0.5], [-r * 0.9, -r * 0.5]], COLORS.gold, COLORS.ember)
  } else if (item.kind === 'surge') {
    polygon(ctx, [[0, -r], [r, r * 0.8], [-r, r * 0.8]], COLORS.lavender)
  } else {
    polygon(ctx, [[-r, -r * 0.3], [-r * 0.4, -r], [r * 0.5, -r * 0.8], [r, 0], [r * 0.5, r * 0.9], [-r * 0.6, r]], COLORS.debris, COLORS.debrisEdge)
  }
  ctx.restore()
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, blink: boolean) {
  if (blink) return
  const y = PLAYER_Y
  polygon(ctx, [[x, y - PLAYER_HEIGHT / 2 - 6], [x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2], [x, y + PLAYER_HEIGHT / 4], [x - PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2]], COLORS.cyan, COLORS.text)
  polygon(ctx, [[x, y - 8], [x + 6, y + 2], [x - 6, y + 2]], COLORS.sky)
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.font = '600 14px ui-monospace, monospace'
  ctx.textBaseline = 'top'
  ctx.fillStyle = COLORS.text
  ctx.textAlign = 'left'
  ctx.fillText(`Score ${state.score}`, 12, 12)

  ctx.textAlign = 'right'
  for (let i = 0; i < MAX_LIVES; i++) {
    const cx = WIDTH - 20 - i * 20
    polygon(
      ctx,
      [[cx, 14], [cx + 7, 21], [cx, 28], [cx - 7, 21]],
      i < state.lives ? COLORS.cyan : COLORS.debris,
    )
  }

  const remaining = Math.max(0, 1 - state.elapsed / RUN_SECONDS)
  ctx.fillStyle = COLORS.debris
  ctx.fillRect(12, 36, WIDTH - 24, 4)
  ctx.fillStyle = state.elapsed < state.surgeUntil ? COLORS.lavender : COLORS.gold
  ctx.fillRect(12, 36, (WIDTH - 24) * remaining, 4)
}

function render(ctx: CanvasRenderingContext2D, state: GameState) {
  drawScene(ctx)
  for (const item of state.items) drawItem(ctx, item)
  const blink = state.elapsed < state.invulnerableUntil && Math.floor(state.elapsed * 12) % 2 === 0
  drawPlayer(ctx, state.playerX, blink)
  if (state.flash > 0) {
    ctx.fillStyle = COLORS.ember
    ctx.globalAlpha = state.flash * 0.25
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.globalAlpha = 1
  }
  drawHud(ctx, state)
}

export function StarDrift() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>(createState())
  const inputRef = useRef({ left: false, right: false, target: null as number | null })
  const reducedMotionRef = useRef(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState({ score: 0, best: 0, isNewBest: false })
  const [best, setBest] = useState(0)

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(BEST_KEY))
    if (Number.isFinite(stored) && stored > 0) setBest(stored)
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = query.matches
    const onChange = () => (reducedMotionRef.current = query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== WIDTH * dpr) {
      canvas.width = WIDTH * dpr
      canvas.height = HEIGHT * dpr
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    return ctx
  }, [])

  const endRun = useCallback(() => {
    const score = stateRef.current.score
    const previous = Number(window.localStorage.getItem(BEST_KEY)) || 0
    const isNewBest = score > previous
    const nextBest = Math.max(score, previous)
    if (isNewBest) window.localStorage.setItem(BEST_KEY, String(score))
    setBest(nextBest)
    setResult({ score, best: nextBest, isNewBest })
    setPhase('over')
  }, [])

  // Draw a still frame whenever the game is not running.
  useEffect(() => {
    if (phase === 'playing') return
    const ctx = getContext()
    if (ctx) render(ctx, stateRef.current)
  }, [phase, getContext])

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return
    const ctx = getContext()
    if (!ctx) return

    let frame = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const state = stateRef.current
      const input = inputRef.current
      const calm = reducedMotionRef.current ? 0.65 : 1

      state.elapsed += dt
      state.flash = Math.max(0, state.flash - dt * 3)

      if (input.target !== null) {
        const delta = input.target - state.playerX
        const maxMove = DRAG_SPEED * dt
        state.playerX += Math.max(-maxMove, Math.min(maxMove, delta))
      } else {
        const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0)
        state.playerX += direction * KEY_SPEED * dt
      }
      state.playerX = Math.max(PLAYER_WIDTH / 2, Math.min(WIDTH - PLAYER_WIDTH / 2, state.playerX))

      const progress = Math.min(state.elapsed / RUN_SECONDS, 1)
      const speed = (1 + progress * 1.1) * calm

      state.spawnTimer -= dt
      if (state.spawnTimer <= 0) {
        state.spawnTimer = Math.max(0.28, 0.7 - progress * 0.35) / calm
        const roll = Math.random()
        const kind: Kind =
          roll < 0.48 ? 'star' : roll < 0.6 ? 'bonus' : roll < 0.65 ? 'surge' : 'debris'
        const r = kind === 'debris' ? 15 : kind === 'bonus' ? 12 : 11
        state.items.push({
          kind,
          x: r + Math.random() * (WIDTH - r * 2),
          y: -r,
          r,
          vy: (115 + Math.random() * 55) * speed,
          spin: Math.random() * Math.PI,
        })
      }

      const multiplier = state.elapsed < state.surgeUntil ? 2 : 1
      const remaining: Item[] = []
      for (const item of state.items) {
        item.y += item.vy * dt
        if (item.kind === 'debris' || !reducedMotionRef.current) item.spin += dt * (item.kind === 'debris' ? 1.2 : 2)

        const close =
          Math.abs(item.x - state.playerX) < PLAYER_WIDTH / 2 + item.r * 0.7 &&
          Math.abs(item.y - PLAYER_Y) < PLAYER_HEIGHT / 2 + item.r * 0.7

        if (close) {
          if (item.kind === 'debris') {
            if (state.elapsed >= state.invulnerableUntil) {
              state.lives -= 1
              state.invulnerableUntil = state.elapsed + 1
              state.flash = 1
            }
            continue
          }
          if (item.kind === 'surge') state.surgeUntil = state.elapsed + 5
          state.score += POINTS[item.kind] * multiplier
          continue
        }
        if (item.y < HEIGHT + item.r) remaining.push(item)
      }
      state.items = remaining

      render(ctx, state)

      if (state.elapsed >= RUN_SECONDS || state.lives <= 0) {
        endRun()
        return
      }
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [phase, getContext, endRun])

  // Keyboard controls and pausing when the tab is hidden
  useEffect(() => {
    if (phase !== 'playing') return

    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      const key = event.key.toLowerCase()
      if (key === 'arrowleft' || key === 'a') {
        inputRef.current.left = pressed
        event.preventDefault()
      } else if (key === 'arrowright' || key === 'd') {
        inputRef.current.right = pressed
        event.preventDefault()
      }
    }
    const onKeyDown = (event: KeyboardEvent) => setKey(event, true)
    const onKeyUp = (event: KeyboardEvent) => setKey(event, false)
    const onVisibility = () => {
      if (document.hidden) {
        inputRef.current = { left: false, right: false, target: null }
        setPhase('paused')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [phase])

  const startRun = () => {
    stateRef.current = createState()
    inputRef.current = { left: false, right: false, target: null }
    setPhase('playing')
  }

  const pointerToGameX = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return ((event.clientX - rect.left) / rect.width) * WIDTH
  }

  const holdButton = (side: 'left' | 'right') => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      inputRef.current[side] = true
    },
    onPointerUp: () => {
      inputRef.current[side] = false
    },
    onPointerCancel: () => {
      inputRef.current[side] = false
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  })

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="relative border-2 border-border shadow-[6px_6px_0_0_var(--border)]">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Star Drift game. Move the ship left and right to collect stars and avoid debris."
          className={cn('block aspect-[3/4] w-full bg-background', phase === 'playing' && 'touch-none')}
          onPointerDown={(event) => {
            if (phase !== 'playing') return
            inputRef.current.target = pointerToGameX(event)
          }}
          onPointerMove={(event) => {
            if (phase !== 'playing' || inputRef.current.target === null) return
            inputRef.current.target = pointerToGameX(event)
          }}
          onPointerUp={() => {
            inputRef.current.target = null
          }}
          onPointerCancel={() => {
            inputRef.current.target = null
          }}
          onPointerLeave={() => {
            inputRef.current.target = null
          }}
        />

        {phase !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/80 p-6 text-center">
            {phase === 'idle' && (
              <>
                <h3 className="font-pixel text-xl text-foreground">Star Drift</h3>
                <p className="max-w-64 text-base leading-relaxed text-muted-foreground">
                  Collect stars. Avoid debris. Beat your best score.
                </p>
                {best > 0 && <p className="text-sm text-gold">Best Score: {best}</p>}
                <PixelButton variant="primary" onClick={startRun}>
                  Start
                </PixelButton>
              </>
            )}
            {phase === 'paused' && (
              <>
                <h3 className="font-pixel text-xl text-foreground">Paused</h3>
                <PixelButton variant="primary" onClick={() => setPhase('playing')}>
                  Resume
                </PixelButton>
              </>
            )}
            {phase === 'over' && (
              <>
                <div role="status" className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-pixel text-3xl text-foreground">{result.score}</p>
                  <p className="text-base text-gold">
                    Best Score: {result.best}
                    {result.isNewBest && <span className="sr-only"> (new personal best)</span>}
                  </p>
                  {result.isNewBest && (
                    <p aria-hidden="true" className="text-sm text-primary">
                      New personal best
                    </p>
                  )}
                </div>
                <PixelButton variant="primary" onClick={startRun}>
                  Play Again
                </PixelButton>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        <button
          type="button"
          aria-label="Move left"
          className="flex min-h-16 touch-none select-none items-center justify-center border-2 border-border bg-card text-foreground active:border-primary active:text-primary"
          {...holdButton('left')}
        >
          <ArrowLeft className="size-7" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Move right"
          className="flex min-h-16 touch-none select-none items-center justify-center border-2 border-border bg-card text-foreground active:border-primary active:text-primary"
          {...holdButton('right')}
        >
          <ArrowRight className="size-7" aria-hidden="true" />
        </button>
      </div>
      <p className="hidden text-sm text-muted-foreground md:block">
        Move with the left and right arrow keys, or A and D.
      </p>
    </div>
  )
}
