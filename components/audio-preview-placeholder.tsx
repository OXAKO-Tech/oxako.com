import { Play } from 'lucide-react'

const BARS = Array.from({ length: 40 }, (_, i) => {
  const wave = Math.sin(i * 0.55) * 0.5 + Math.sin(i * 1.7) * 0.3
  return Math.round(28 + (wave + 0.8) * 32)
})

export function AudioPreviewPlaceholder({ label }: { label: string }) {
  return (
    <div className="border-2 border-border bg-background/60 p-3">
      <p className="mb-3 flex justify-between gap-2 text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="text-primary">Coming soon</span>
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled
          aria-label="Audio preview not available yet"
          className="flex size-11 shrink-0 items-center justify-center border-2 border-border text-muted-foreground disabled:cursor-not-allowed"
        >
          <Play className="size-4" aria-hidden="true" />
        </button>
        <div aria-hidden="true" className="flex h-11 min-w-0 flex-1 items-center gap-px">
          {BARS.map((height, i) => (
            <span
              key={i}
              className="w-full min-w-px bg-muted-foreground/50"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>0:00</span>
        <span>0:30</span>
      </div>
    </div>
  )
}
