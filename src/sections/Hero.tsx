import React, { useRef, useState, useEffect, Suspense, useCallback } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'
import { heroProgress } from '../lib/scrollState'
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
        { yPercent: 50, opacity: 0.2 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
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
        { opacity: 0.3, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
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
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const [canLoad3D, setCanLoad3D] = useState(false)

  useStaggerReveal(titleRef)
  useHeroContentReveal(heroRef)

  // Lazy import 3D scene after window load + IntersectionObserver so HTML/CTA paint first
  useEffect(() => {
    let isIntersecting = false
    let isWindowLoaded = typeof document !== 'undefined' && document.readyState === 'complete'

    const checkAndMount = () => {
      if (isIntersecting && isWindowLoaded) {
        setCanLoad3D(true)
      }
    }

    const onLoad = () => {
      isWindowLoaded = true
      checkAndMount()
    }

    if (!isWindowLoaded) {
      window.addEventListener('load', onLoad, { once: true })
    }

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting
      checkAndMount()
    }, { rootMargin: '200px' })

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    // Safety timeout in case window load already fired or takes too long
    const timer = setTimeout(() => {
      setCanLoad3D(true)
    }, 1200)

    return () => {
      window.removeEventListener('load', onLoad)
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])

  // Pin hero 150vh scrub, disabled on mobile or reduced-motion
  React.useLayoutEffect(() => {
    if (!sectionRef.current || isMobile || reducedMotion) {
      heroProgress.current = 0
      return
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          heroProgress.current = self.progress
        }
      })
    })

    return () => {
      ctx.revert()
      heroProgress.current = 0
    }
  }, [isMobile, reducedMotion])

  return (
    <section className="scene scene-hero" id="hero" ref={sectionRef}>
      <div className="canvas-container" aria-hidden="true">
        {hasWebGL && canLoad3D ? (
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
