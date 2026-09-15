import React, { useRef, Suspense, useCallback } from 'react'
import { gsap } from '../lib/gsap'
import { useSplitReveal } from '../hooks/useSplitReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

function TiltCard({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || window.matchMedia('(hover: none)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`
  }, [])

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  )
}

interface PillarsProps {
  hasWebGL: boolean
  PillarScene: React.LazyExoticComponent<any>
  LazyInView: React.FC<{ children: React.ReactNode }>
  LoadingSpinner: React.FC
  AnimatedCounter: React.FC<{ target: number; suffix?: string }>
}

export default function Pillars({ hasWebGL, PillarScene, LazyInView, LoadingSpinner, AnimatedCounter }: PillarsProps) {
  const pillarsTitleRef = useRef<HTMLHeadingElement>(null)
  const pillarsRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useSplitReveal(pillarsTitleRef)

  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // General reveal for .reveal class inside this section
      const revealEls = pillarsRef.current?.querySelectorAll('.reveal')
      if (revealEls) {
        revealEls.forEach((el) => {
          gsap.fromTo(el,
            { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 50 },
            {
              opacity: 1, y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
          )
        })
      }

      // Stagger pillar cards with clip-path reveal from rescue-dot1
      const cards = pillarsRef.current?.querySelectorAll('.pillar-card')
      if (cards) {
        cards.forEach((card, i) => {
          gsap.fromTo(card,
            {
              clipPath: reducedMotion ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
              opacity: reducedMotion ? 1 : 0,
              y: reducedMotion ? 0 : 40,
              scale: reducedMotion ? 1 : 0.95
            },
            {
              clipPath: 'inset(0% 0 0 0)',
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              delay: reducedMotion ? 0 : i * 0.1,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 85%', once: true }
            }
          )
        })
      }
    })
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section className="scene scene-pillars" id="pillars">
      <div className="canvas-container" aria-hidden="true">
        {hasWebGL ? (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyInView><PillarScene /></LazyInView>
          </Suspense>
        ) : null}
      </div>
      <div className="pillars-content reveal" ref={pillarsRef}>
        <h2 ref={pillarsTitleRef}>
          <AnimatedCounter target={siteContent.pillars.items.length} /> {siteContent.pillars.title}
        </h2>
        <div className="pillars-grid">
          {siteContent.pillars.items.map((item) => (
            <TiltCard key={item.id} className="pillar-card glass-card">
              <span className="pillar-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </TiltCard>
          ))}
        </div>
      </div>
      <div className="section-fade-bottom" />
    </section>
  )
}
