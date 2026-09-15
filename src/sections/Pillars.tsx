import React, { useRef, Suspense } from 'react'
import { gsap } from '../lib/gsap'
import { useSplitReveal } from '../hooks/useSplitReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

interface PillarsProps {
  hasWebGL: boolean
  PillarScene: React.LazyExoticComponent<any>
  LazyInView: React.FC<{children: React.ReactNode}>
  LoadingSpinner: React.FC
  AnimatedCounter: React.FC<{target: number; suffix?: string}>
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

      // Stagger pillar cards
      const cards = pillarsRef.current?.querySelectorAll('.pillar-card')
      if (cards) {
        cards.forEach((card, i) => {
          gsap.fromTo(card,
            { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 40, scale: reducedMotion ? 1 : 0.95 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 0.7,
              delay: reducedMotion ? 0 : i * 0.15,
              ease: 'power2.out',
              scrollTrigger: { trigger: card, start: 'top 85%', once: true }
            }
          )
        })
      }

      // Parallax icon
      if (!reducedMotion) {
        const icons = pillarsRef.current?.querySelectorAll('.pillar-icon')
        if (icons) {
          icons.forEach(icon => {
            gsap.fromTo(icon,
              { yPercent: -10 },
              {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                  trigger: icon.closest('.pillar-card'),
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true
                }
              }
            )
          })
        }
      }
    })
    return () => ctx.revert()
  }, [reducedMotion])

  const handlePillarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--mx', `${x}px`)
    card.style.setProperty('--my', `${y}px`)
  }

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
        <h2 ref={pillarsTitleRef}><AnimatedCounter target={siteContent.pillars.items.length} /> {siteContent.pillars.title}</h2>
        <div className="pillars-grid">
          {siteContent.pillars.items.map((item) => (
            <div key={item.id} className="pillar-card glass-card" onPointerMove={handlePillarPointerMove}>
              <span className="pillar-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="section-fade-bottom" />
    </section>
  )
}
