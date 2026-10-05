/**
 * Moon Drift game logic. Pure TypeScript with no React or three.js imports, so
 * movement, spawning and collisions can be reasoned about (and tuned) in one place.
 *
 * World model: the UFO stays at z = 0. Everything else lives at a "distance" along
 * the course; its z is -(dist - travel). All timing is delta-time based.
 */

export const LANES = [-3.6, -1.8, 0, 1.8, 3.6] as const
const CENTER_LANE = 2

export const CFG = {
  shields: 3,
  invulnSeconds: 1,

  // Flight area
  xLimit: 4.2,
  yMin: 0.7,
  yMax: 2.5,
  yStart: 1.6,

  // UFO handling: fast acceleration, firm braking, capped speed
  maxSpeedX: 9,
  accelX: 85,
  brakeX: 60,
  maxSpeedY: 5.2,
  accelY: 60,
  brakeY: 50,

  // Boost: short, snappy, cooldown-based
  boostTime: 0.4,
  boostCooldown: 2.2,
  boostSpeedMul: 1.7,
  boostAccelMul: 1.5,
  boostImpulse: 1.6,

  // Course
  rowSpacing: 9,
  firstRowDist: 22,
  spawnDist: 72,
  // No debris may reach the player before this much course has scrolled by
  safeStartDist: 56,
  despawnDz: -16,

  // Hit shapes
  playerRadius: 0.55,
  fragmentRadius: 0.6,

  // Endless difficulty: every stage is a little faster and denser, up to a ceiling
  stageSeconds: 12,
  baseSpeed: 14,
  speedPerStage: 2.2,
  maxSpeed: 30,
  rockChanceBase: 0.35,
  rockChancePerStage: 0.1,
  rockChanceMax: 0.9,

  // Score
  points: [10, 50, 25] as const,
  multiplierSeconds: 6,
  // A run has no timer, so a shield is restored now and then to reward long flights
  shieldEveryPoints: 400,

  // Day and night: seconds per full cycle, and where the day sits inside it
  dayCycleSeconds: 64,
  dayRiseStart: 24,
  dayRiseEnd: 32,
  dayFallStart: 48,
  dayFallEnd: 56,
} as const

export const speedForStage = (stage: number) =>
  Math.min(CFG.maxSpeed, CFG.baseSpeed + stage * CFG.speedPerStage)

export const rockChanceForStage = (stage: number) =>
  Math.min(CFG.rockChanceMax, CFG.rockChanceBase + stage * CFG.rockChancePerStage)

export const rockMaxForStage = (stage: number) => (stage < 1 ? 1 : stage < 3 ? 2 : 3)

export const FRAGMENT = { cyan: 0, gold: 1, lavender: 2 } as const
export type FragmentKind = 0 | 1 | 2

export interface Entity {
  active: boolean
  kind: number
  x: number
  y: number
  dist: number
  radius: number
  size: number
  sx: number
  sy: number
  sz: number
  spinX: number
  spinY: number
  spinZ: number
  phase: number
  drift: number
  dying: boolean
  life: number
  // Resolved each update, read by the renderer
  wx: number
  wy: number
}

export interface GameInput {
  left: boolean
  right: boolean
  up: boolean
  down: boolean
  dragging: boolean
  tx: number
  ty: number
  boost: boolean
}

export const createInput = (): GameInput => ({
  left: false,
  right: false,
  up: false,
  down: false,
  dragging: false,
  tx: 0,
  ty: 0,
  boost: false,
})

export interface HudState {
  score: number
  shields: number
  elapsed: number
  stage: number
  multiplier: boolean
  boostCharge: number
}

export type EndReason = 'shields'

export interface EngineEvents {
  onCollect?: (kind: FragmentKind, points: number) => void
  onHit?: (shieldsLeft: number) => void
  onShieldRestored?: (shields: number) => void
  onEnd?: (reason: EndReason, score: number) => void
}

const FRAGMENT_POOL = 48
const ROCK_POOL = 40

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function approach(value: number, target: number, step: number) {
  if (value < target) return Math.min(target, value + step)
  return Math.max(target, value - step)
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createEntity(): Entity {
  return {
    active: false,
    kind: 0,
    x: 0,
    y: 0,
    dist: 0,
    radius: 0,
    size: 1,
    sx: 1,
    sy: 1,
    sz: 1,
    spinX: 0,
    spinY: 0,
    spinZ: 0,
    phase: 0,
    drift: 0,
    dying: false,
    life: 1,
    wx: 0,
    wy: 0,
  }
}

export class MoonDriftEngine {
  events: EngineEvents = {}
  running = false

  // Renderer reads these
  readonly fragments: Entity[] = Array.from({ length: FRAGMENT_POOL }, createEntity)
  readonly rocks: Entity[] = Array.from({ length: ROCK_POOL }, createEntity)
  px = 0
  py: number = CFG.yStart
  vx = 0
  vy = 0
  travel = 0
  speed = 9
  elapsed = 0
  score = 0
  shields: number = CFG.shields
  invuln = 0
  boostTime = 0
  boostCooldown = 0
  multiplierTime = 0
  hitPulse = 0
  /** Written by the scene on resize: world units per CSS pixel at the UFO's depth. */
  view = { worldPerPx: 0.012 }

  private rng: () => number = Math.random
  private nextRow = 0
  private safeLane = CENTER_LANE
  private chainLeft = 5
  private gap = 0
  private nextLavenderDist = 110
  private lastDir = 0
  private nextShieldScore: number = CFG.shieldEveryPoints

  constructor() {
    this.reset()
  }

  reset(seed = (Math.random() * 2 ** 32) >>> 0) {
    this.rng = mulberry32(seed)
    for (const e of this.fragments) e.active = false
    for (const e of this.rocks) e.active = false
    this.px = 0
    this.py = CFG.yStart
    this.vx = 0
    this.vy = 0
    this.travel = 0
    this.speed = 9
    this.elapsed = 0
    this.score = 0
    this.shields = CFG.shields
    this.invuln = 0
    this.boostTime = 0
    this.boostCooldown = 0
    this.multiplierTime = 0
    this.hitPulse = 0
    this.nextRow = 0
    this.safeLane = CENTER_LANE
    this.chainLeft = 5
    this.gap = 0
    this.nextLavenderDist = 110
    this.lastDir = 0
    this.nextShieldScore = CFG.shieldEveryPoints
    this.fillRows()
    this.resolvePositions()
  }

  get stage() {
    return Math.floor(this.elapsed / CFG.stageSeconds)
  }

  get boosting() {
    return this.boostTime > 0
  }

  /** 0 at night, 1 at full day. The sky loops through long nights with a short day between. */
  get daylight() {
    const t = this.elapsed % CFG.dayCycleSeconds
    const rise = smoothstep(CFG.dayRiseStart, CFG.dayRiseEnd, t)
    const fall = 1 - smoothstep(CFG.dayFallStart, CFG.dayFallEnd, t)
    return Math.min(rise, fall)
  }

  snapshot(): HudState {
    return {
      score: this.score,
      shields: this.shields,
      elapsed: this.elapsed,
      stage: this.stage + 1,
      multiplier: this.multiplierTime > 0,
      boostCharge: this.boostTime > 0 ? 0 : clamp(1 - this.boostCooldown / CFG.boostCooldown, 0, 1),
    }
  }

  update(rawDt: number, input: GameInput) {
    if (!this.running) return
    const dt = Math.min(rawDt, 0.05)
    if (dt <= 0) return

    this.elapsed += dt
    this.updateTimers(dt)
    this.updateMovement(dt, input)

    const prevTravel = this.travel
    const targetSpeed = speedForStage(this.stage)
    this.speed += (targetSpeed - this.speed) * Math.min(1, dt * 1.4)
    this.travel += this.speed * dt

    this.fillRows()
    this.updateEntities(dt, prevTravel)
    this.resolvePositions()

    if (this.shields <= 0) this.finish('shields')
  }

  private finish(reason: EndReason) {
    this.running = false
    this.events.onEnd?.(reason, this.score)
  }

  private updateTimers(dt: number) {
    this.invuln = Math.max(0, this.invuln - dt)
    this.boostTime = Math.max(0, this.boostTime - dt)
    this.boostCooldown = Math.max(0, this.boostCooldown - dt)
    this.multiplierTime = Math.max(0, this.multiplierTime - dt)
    this.hitPulse = Math.max(0, this.hitPulse - dt)
  }

  private updateMovement(dt: number, input: GameInput) {
    let ax = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    let ay = (input.up ? 1 : 0) - (input.down ? 1 : 0)

    // Analog steering from drag: proportional near the target so it never overshoots
    if (ax === 0 && input.dragging) ax = clamp((input.tx - this.px) / 0.6, -1, 1)
    if (ay === 0 && input.dragging) ay = clamp((input.ty - this.py) / 0.5, -1, 1)

    if (input.boost) {
      input.boost = false
      if (this.boostCooldown <= 0 && this.boostTime <= 0) {
        this.boostTime = CFG.boostTime
        this.boostCooldown = CFG.boostCooldown
        const dir = ax !== 0 ? Math.sign(ax) : this.lastDir
        if (dir !== 0) this.vx = dir * CFG.maxSpeedX * CFG.boostImpulse
      }
    }
    if (ax !== 0) this.lastDir = Math.sign(ax)

    const boosting = this.boostTime > 0
    const maxX = CFG.maxSpeedX * (boosting ? CFG.boostSpeedMul : 1)
    const maxY = CFG.maxSpeedY * (boosting ? 1.2 : 1)
    const accelX = (ax !== 0 ? CFG.accelX : CFG.brakeX) * (boosting ? CFG.boostAccelMul : 1)
    const accelY = ay !== 0 ? CFG.accelY : CFG.brakeY

    this.vx = approach(this.vx, ax * maxX, accelX * dt)
    this.vy = approach(this.vy, ay * maxY, accelY * dt)

    this.px += this.vx * dt
    this.py += this.vy * dt

    if (this.px > CFG.xLimit) {
      this.px = CFG.xLimit
      this.vx = Math.min(this.vx, 0)
    } else if (this.px < -CFG.xLimit) {
      this.px = -CFG.xLimit
      this.vx = Math.max(this.vx, 0)
    }
    if (this.py > CFG.yMax) {
      this.py = CFG.yMax
      this.vy = Math.min(this.vy, 0)
    } else if (this.py < CFG.yMin) {
      this.py = CFG.yMin
      this.vy = Math.max(this.vy, 0)
    }
  }

  private updateEntities(dt: number, prevTravel: number) {
    const hitRange = CFG.playerRadius

    for (const e of this.fragments) {
      if (!e.active) continue
      if (e.dying) {
        e.life -= dt * 5
        if (e.life <= 0) e.active = false
        continue
      }
      if (e.dist - this.travel < CFG.despawnDz) {
        e.active = false
        continue
      }
      if (this.touches(e, prevTravel, hitRange)) {
        e.dying = true
        e.life = 1
        const kind = e.kind as FragmentKind
        if (kind === FRAGMENT.lavender) this.multiplierTime = CFG.multiplierSeconds
        const points = CFG.points[kind] * (this.multiplierTime > 0 ? 2 : 1)
        this.score += points
        this.events.onCollect?.(kind, points)
        this.restoreShieldIfEarned()
      }
    }

    for (const e of this.rocks) {
      if (!e.active) continue
      if (e.dying) {
        e.life -= dt * 4
        if (e.life <= 0) e.active = false
        continue
      }
      if (e.dist - this.travel < CFG.despawnDz) {
        e.active = false
        continue
      }
      if (this.invuln <= 0 && this.touches(e, prevTravel, hitRange)) {
        e.dying = true
        e.life = 1
        this.shields = Math.max(0, this.shields - 1)
        this.invuln = CFG.invulnSeconds
        this.hitPulse = 0.35
        this.events.onHit?.(this.shields)
      }
    }
  }

  private restoreShieldIfEarned() {
    while (this.score >= this.nextShieldScore) {
      this.nextShieldScore += CFG.shieldEveryPoints
      if (this.shields < CFG.shields) {
        this.shields += 1
        this.events.onShieldRestored?.(this.shields)
      }
    }
  }

  /** Swept test so a fast rock can never skip through the UFO between two frames. */
  private touches(e: Entity, prevTravel: number, playerRadius: number) {
    const dzNow = e.dist - this.travel
    const dzPrev = e.dist - prevTravel
    const dz = dzNow <= 0 && dzPrev >= 0 ? 0 : Math.min(Math.abs(dzNow), Math.abs(dzPrev))
    const dx = this.entityX(e) - this.px
    const dy = this.entityY(e) - this.py
    const reach = playerRadius + e.radius
    return dx * dx + dy * dy + dz * dz < reach * reach
  }

  private entityX(e: Entity) {
    return e.x + Math.sin(this.elapsed * 0.9 + e.phase) * e.drift
  }

  private entityY(e: Entity) {
    return e.y + (e.drift > 0 ? Math.sin(this.elapsed * 1.3 + e.phase) * 0.12 : 0)
  }

  private resolvePositions() {
    for (const e of this.fragments) {
      if (!e.active) continue
      e.wx = e.x
      e.wy = e.y + Math.sin(this.elapsed * 2 + e.phase) * 0.06
    }
    for (const e of this.rocks) {
      if (!e.active) continue
      e.wx = this.entityX(e)
      e.wy = this.entityY(e)
    }
  }

  // ---------------------------------------------------------------------------
  // Course generation
  //
  // Every row has a "safe lane" that is guaranteed free of debris. The safe lane
  // moves at most one lane per row and debris never occupies the current or
  // previous safe lane, so a clear path always exists, and the main fragment
  // chain follows it. Extra fragments sit in lanes that are clear on their row.
  // ---------------------------------------------------------------------------

  private fillRows() {
    while (CFG.firstRowDist + this.nextRow * CFG.rowSpacing - this.travel <= CFG.spawnDist) {
      this.generateRow(this.nextRow)
      this.nextRow += 1
    }
  }

  private generationStage() {
    const lookahead = CFG.spawnDist / Math.max(this.speed, 1)
    return Math.floor((this.elapsed + lookahead) / CFG.stageSeconds)
  }

  private generateRow(index: number) {
    const dist = CFG.firstRowDist + index * CFG.rowSpacing
    const prevSafe = this.safeLane
    if (index > 0) this.safeLane = this.walkSafeLane(prevSafe)
    const safe = this.safeLane
    const stage = this.generationStage()

    // Debris
    const rockLanes: number[] = []
    if (dist >= CFG.safeStartDist && this.rng() < rockChanceForStage(stage)) {
      const candidates = LANES.map((_, i) => i).filter((i) => i !== safe && i !== prevSafe)
      const rockMax = rockMaxForStage(stage)
      let count = 1
      if (rockMax > 1 && this.rng() < 0.55) count += 1
      if (rockMax > 2 && this.rng() < 0.4) count += 1
      count = Math.min(count, candidates.length)
      for (let i = 0; i < count; i++) {
        const pick = Math.floor(this.rng() * candidates.length)
        rockLanes.push(candidates.splice(pick, 1)[0])
      }
    }
    for (const lane of rockLanes) this.spawnRock(lane, dist)

    // Main chain on the safe lane
    const chainY = CFG.yStart + 0.5 * Math.sin(index * 0.55)
    if (dist >= this.nextLavenderDist) {
      this.nextLavenderDist += 130 + this.rng() * 40
      this.spawnFragment(FRAGMENT.lavender, safe, chainY, dist)
    } else if (this.gap > 0) {
      this.gap -= 1
    } else {
      this.spawnFragment(FRAGMENT.cyan, safe, chainY, dist)
      this.chainLeft -= 1
      if (this.chainLeft <= 0) {
        this.gap = 1 + Math.floor(this.rng() * 2)
        this.chainLeft = 4 + Math.floor(this.rng() * 5)
      }
    }

    // Optional greed fragment off the safe lane (always on a clear lane)
    if (this.rng() < 0.4) {
      const options = LANES.map((_, i) => i).filter(
        (i) => i !== safe && !rockLanes.includes(i) && Math.abs(i - safe) <= 2,
      )
      if (options.length > 0) {
        const lane = options[Math.floor(this.rng() * options.length)]
        const y = CFG.yMin + 0.15 + this.rng() * (CFG.yMax - CFG.yMin - 0.3)
        const kind = this.rng() < 0.3 ? FRAGMENT.gold : FRAGMENT.cyan
        this.spawnFragment(kind, lane, y, dist + (this.rng() - 0.5) * 2)
      }
    }
  }

  private walkSafeLane(current: number) {
    if (this.rng() < 0.5) return current
    let dir = this.rng() < 0.5 ? -1 : 1
    if (current === 0) dir = 1
    if (current === LANES.length - 1) dir = -1
    return current + dir
  }

  private spawnFragment(kind: FragmentKind, lane: number, y: number, dist: number) {
    const e = this.fragments.find((f) => !f.active)
    if (!e) return
    e.active = true
    e.dying = false
    e.life = 1
    e.kind = kind
    e.x = LANES[lane]
    e.y = y
    e.dist = dist
    e.radius = CFG.fragmentRadius
    e.size = kind === FRAGMENT.cyan ? 1 : 1.2
    e.phase = this.rng() * Math.PI * 2
    e.spinY = 1.6 + this.rng() * 0.8
    e.drift = 0
  }

  private spawnRock(lane: number, dist: number) {
    const e = this.rocks.find((r) => !r.active)
    if (!e) return
    const size = 0.8 + this.rng() * 0.35
    const slab = this.rng() < 0.3
    e.active = true
    e.dying = false
    e.life = 1
    e.kind = 0
    e.x = LANES[lane]
    e.y = CFG.yMin + 0.1 + this.rng() * (CFG.yMax - CFG.yMin)
    e.dist = dist + (this.rng() - 0.5) * 2
    e.size = size
    e.sx = slab ? 1.35 : 0.9 + this.rng() * 0.3
    e.sy = slab ? 0.5 : 0.85 + this.rng() * 0.3
    e.sz = slab ? 1.05 : 0.9 + this.rng() * 0.3
    // Collision shape is smaller than the visual so near misses feel fair
    e.radius = size * 0.72
    e.phase = this.rng() * Math.PI * 2
    e.spinX = (this.rng() - 0.5) * 0.8
    e.spinY = (this.rng() - 0.5) * 0.8
    e.spinZ = (this.rng() - 0.5) * 0.6
    e.drift = this.rng() < 0.5 ? 0.2 : 0
  }
}
