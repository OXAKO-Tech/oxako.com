'use client'

import { useCallback, useState } from 'react'
import { FrequencyTuner } from '@/components/frequency-tuner'
import { AudioPreviewPlaceholder } from '@/components/audio-preview-placeholder'

export function HiddenTrack() {
  const [unlocked, setUnlocked] = useState(false)
  const unlock = useCallback(() => setUnlocked(true), [])

  return (
    <section
      id="hidden-track"
      aria-labelledby="hidden-track-title"
      className="facet bg-border p-px"
    >
      <div className="facet-inner grid gap-8 bg-card p-5 sm:p-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Optional extra</p>
          <h2
            id="hidden-track-title"
            className="font-pixel text-lg leading-snug text-foreground sm:text-xl"
          >
            Hidden Track
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Tune the radio to unlock an unreleased OXAKO preview. Drag the dial,
            use your arrow keys, or press Auto-tune.
          </p>
          <div aria-live="polite">
            {unlocked && (
              <div className="mt-2 flex flex-col gap-3">
                <p className="text-sm font-medium text-primary">
                  Unlocked: unreleased preview
                </p>
                <AudioPreviewPlaceholder label="Unreleased preview" />
              </div>
            )}
          </div>
        </div>
        <FrequencyTuner unlocked={unlocked} onUnlock={unlock} />
      </div>
    </section>
  )
}
