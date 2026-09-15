import React, { useRef, Suspense, useCallback } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

function MagneticCTA({ href, children, ariaLabel }: { href: string; children: React.ReactNode; ariaLabel?: string }) {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 80) {
      const pull = (80 - dist) / 80
      ref.current.style.transform = `translate(${dx * pull * 0.3}px, ${dy * pull * 0.3}px)`
    }
  }, [])

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <a
      ref={ref}
      href={href}
      className="cta-btn"
      aria-label={ariaLabel}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </a>
  )
}

function useStaggerReveal(ref: React.RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion()
  React.useLayoutEffect(() => {
    if (!ref.current || reducedMotion) return

    const lines = ref.current.querySelectorAll('.title-line')
    const ctx = gsap.context(() => {
      gsap.fromTo(lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.2,
        }
      )
    })
    return () => ctx.revert()
  }, [ref, reducedMotion])
}

function useHeroContentReveal(ref: React.RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion()
  React.useLayoutEffect(() => {
    if (!ref.current || reducedMotion) return

    const slogan = ref.current.querySelector('.hero-slogan')
    const cta = ref.current.querySelector('.cta-btn')
    const ctx = gsap.context(() => {
      gsap.fromTo([slogan, cta],
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
          delay: 0.7,
        }
      )
    })
    return () => ctx.revert()
  }, [ref, reducedMotion])
}

interface HeroProps {
  hasWebGL: boolean
  HeroScene: React.LazyExoticComponent<any>
  LoadingSpinner: React.FC
  StaticFallback: React.FC
}

export default function Hero({ hasWebGL, HeroScene, LoadingSpinner, StaticFallback }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useStaggerReveal(titleRef)
  useHeroContentReveal(heroRef)

  return (
    <section className="scene scene-hero" id="hero">
      <div className="canvas-container" aria-hidden="true">
        {hasWebGL ? (
          <Suspense fallback={<LoadingSpinner />}>
            <HeroScene />
          </Suspense>
        ) : (
          <StaticFallback />
        )}
      </div>
      <div className="hero-overlay" ref={heroRef}>
        <h1 className="hero-title" ref={titleRef}>
          {siteContent.hero.title.map((line, idx) => (
            <span key={idx} className="hero-line-mask">
              <span className="title-line">{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-slogan">{siteContent.hero.slogan}</p>
        <MagneticCTA href="#pillars" ariaLabel={siteContent.hero.cta}>
          {siteContent.hero.cta}
        </MagneticCTA>
      </div>
      <div className="section-fade-bottom" />
    </section>
  )
}
