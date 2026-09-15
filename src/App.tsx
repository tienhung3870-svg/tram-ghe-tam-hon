import React, { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from './lib/gsap'

import SmoothScroll from './SmoothScroll'
import Hero from './sections/Hero'
import Pillars from './sections/Pillars'
import Books from './sections/Books'
import About from './sections/About'
import Contact from './sections/Contact'
import { siteContent } from './content/site'

import './App.css'

// Lazy load scenes
const HeroScene = React.lazy(() => import('./scenes/HeroScene'))
const PillarScene = React.lazy(() => import('./scenes/PillarScene'))
const BookScene = React.lazy(() => import('./scenes/BookScene'))

// Helper to check WebGL
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (e) {
    return false
  }
}

function StaticFallback() {
  return (
    <div className="static-fallback">
      <div className="fallback-gradient" />
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p style={{ color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>LOADING EXPERIENCE</p>
    </div>
  )
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return
    const onMove = (e: MouseEvent) => {
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: e.clientX - 200,
          y: e.clientY - 200,
          duration: 0.8,
          ease: 'power3.out'
        })
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return <div className="cursor-glow" ref={glowRef} />
}

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      barRef.current.style.width = `${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress-bar" ref={barRef} style={{ position: 'fixed', top: 0, left: 0, height: '4px', background: 'var(--gold)', zIndex: 9999, transition: 'width 0.1s' }} />
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      const obj = { val: 0 }
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => {
              if (ref.current) ref.current.textContent = `${Math.round(obj.val)}${suffix}`
            }
          })
        }
      })
    })
    return () => ctx.revert()
  }, [target, suffix])
  return <span ref={ref}>0{suffix}</span>
}

function LazyInView({ children }: { children: React.ReactNode }) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect() }
    }, { rootMargin: '400px' })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{inView ? children : null}</div>
}

export default function App() {
  const [hasWebGL, setHasWebGL] = useState(true)

  useLayoutEffect(() => {
    setHasWebGL(detectWebGL())
  }, [])

  return (
    <SmoothScroll>
      <div className="app">
        <ScrollProgressBar />
        <CursorGlow />

        <Hero hasWebGL={hasWebGL} HeroScene={HeroScene} LoadingSpinner={LoadingSpinner} StaticFallback={StaticFallback} />
        
        <Pillars hasWebGL={hasWebGL} PillarScene={PillarScene} LazyInView={LazyInView} LoadingSpinner={LoadingSpinner} AnimatedCounter={AnimatedCounter} />

        <Books hasWebGL={hasWebGL} BookScene={BookScene} LazyInView={LazyInView} LoadingSpinner={LoadingSpinner} />

        <About />

        <Contact />

        {/* FOOTER */}
        <footer className="site-footer reveal">
          <p>{siteContent.footer.brand} · {siteContent.footer.slogan}</p>
          <div className="social-links">
            <a href={siteContent.contact.socialLinks.tiktok} target="_blank" rel="noopener" aria-label="TikTok">TikTok</a>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  )
}
