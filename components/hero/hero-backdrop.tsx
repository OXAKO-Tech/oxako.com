'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { hasWebGL } from '@/lib/has-webgl'
import { cn } from '@/lib/utils'

// The three.js bundle is only requested on the client, after the page has painted
const HeroCanvas = dynamic(() => import('./hero-canvas'), { ssr: false })

const DESCRIPTION =
  'A tall grey-green alien in a retro low-resolution 3D scene faces you on a foggy plain under a starry sky, waving hello and glancing around while a distant tower crackles with cold blue light.'

export function HeroBackdrop() {
  const container = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'pending' | 'webgl' | 'static'>('pending')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMode(hasWebGL() ? 'webgl' : 'static')

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    query.addEventListener('change', onChange)

    const onVisibility = () => setTabVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      query.removeEventListener('change', onChange)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    const node = container.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={container} role="img" aria-label={DESCRIPTION} className="pointer-events-none absolute inset-0">
      {mode === 'static' && (
        <Image
          src="/images/oxako-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_55%]"
        />
      )}
      {mode === 'webgl' && (
        <div className={cn('absolute inset-0 transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}>
          <HeroCanvas
            animate={!reducedMotion}
            running={inView && tabVisible}
            onReady={() => setReady(true)}
          />
        </div>
      )}
    </div>
  )
}
