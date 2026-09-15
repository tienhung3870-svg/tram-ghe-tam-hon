import React, { useLayoutEffect, useRef, useState, lazy, Suspense } from 'react'
import { gsap, ScrollTrigger } from './lib/gsap'

import SmoothScroll from './SmoothScroll'
import Cursor from './components/Cursor'
import Marquee from './components/Marquee'

import Hero from './sections/Hero'
import Pillars from './sections/Pillars'
import Books from './sections/Books'
import About from './sections/About'
import Contact from './sections/Contact'
import { siteContent } from './content/site'

import './App.css'

// Lazy load scenes & heavy components
const Preloader = lazy(() => import('./components/Preloader'))
const HeroScene = lazy(() => import('./scenes/HeroScene'))
const PillarScene = lazy(() => import('./scenes/PillarScene'))
const BookScene = lazy(() => import('./scenes/BookScene'))

// Helper to check WebGL
function detectWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
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

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      const s = window.scrollY
      const d = document.documentElement.scrollHeight - window.innerHeight
      barRef.current.style.width = `${d > 0 ? (s / d) * 100 : 0}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress-bar" ref={barRef} />
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
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
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
      <Suspense fallback={null}>
        <Preloader />
      </Suspense>
      <Cursor />
      <div className="app">
        <ScrollProgressBar />

        <Hero
          hasWebGL={hasWebGL}
          HeroScene={HeroScene}
          LoadingSpinner={LoadingSpinner}
          StaticFallback={StaticFallback}
        />

        <Marquee />

        <Pillars
          hasWebGL={hasWebGL}
          PillarScene={PillarScene}
          LazyInView={LazyInView}
          LoadingSpinner={LoadingSpinner}
          AnimatedCounter={AnimatedCounter}
        />

        <Books
          hasWebGL={hasWebGL}
          BookScene={BookScene}
          LazyInView={LazyInView}
          LoadingSpinner={LoadingSpinner}
        />

        <About />

        <Contact />

        <footer className="site-footer reveal">
          <p>{siteContent.footer.brand} · {siteContent.footer.slogan}</p>
          <div className="social-links">
            <a href={siteContent.contact.socialLinks.tiktok} target="_blank" rel="noopener" aria-label="TikTok">
              TikTok
            </a>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  )
}
