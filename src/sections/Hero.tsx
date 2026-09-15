import React, { useRef, Suspense } from 'react'
import { gsap } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

// Hooks moved from App.tsx
function useStaggerReveal(ref: React.RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion()
  React.useLayoutEffect(() => {
    if (!ref.current || reducedMotion) return

    const children = ref.current.querySelectorAll('.title-line')
    const ctx = gsap.context(() => {
      gsap.fromTo(children,
        { opacity: 0, y: 30, rotateX: 40 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          delay: 0.3,
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
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 0.9,
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
            <span key={idx} className="title-line">{line}</span>
          ))}
        </h1>
        <p className="hero-slogan">{siteContent.hero.slogan}</p>
        <a href="#pillars" className="cta-btn" aria-label={siteContent.hero.cta}>{siteContent.hero.cta}</a>
      </div>
      <div className="section-fade-bottom" />
    </section>
  )
}
