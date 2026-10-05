'use client'

import { useState } from 'react'
import { ArchiveTerminal } from '@/components/archive-terminal'
import { CrtOverlay } from '@/components/crt-overlay'
import { LandingScreen } from '@/components/landing-screen'

export function OxakoExperience() {
  const [entered, setEntered] = useState(false)

  return (
    <>
      {entered ? (
        <ArchiveTerminal onExit={() => setEntered(false)} />
      ) : (
        <LandingScreen onEnter={() => setEntered(true)} />
      )}
      <CrtOverlay />
    </>
  )
}
