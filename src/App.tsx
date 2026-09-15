import { Suspense, lazy, useEffect, useState, useRef, useCallback } from 'react'
import './App.css'
import SmoothScroll from './SmoothScroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeroScene = lazy(() => import('./scenes/HeroScene'))
const BookScene = lazy(() => import('./scenes/BookScene'))
const PillarScene = lazy(() => import('./scenes/PillarScene'))

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch { return false }
}

function StaticFallback() {
  return <div className="fallback-hero"><div className="fallback-gradient" /></div>
}

function LoadingSpinner() {
  return <div className="loading-spinner"><div className="spinner" /><p>Đang tải...</p></div>
}

function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = () => {
      if (!barRef.current) return
      const s = window.scrollY
      const d = document.documentElement.scrollHeight - window.innerHeight
      barRef.current.style.width = `${d > 0 ? (s / d) * 100 : 0}%`
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return <div className="scroll-progress-bar" ref={barRef} />
}

function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: MouseEvent) => {
    if (glowRef.current) glowRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`
  }, [])
  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [onMove])
  return <div className="cursor-glow" ref={glowRef} />
}

function MagneticCTA({ href, children }: { href: string; children: React.ReactNode }) {
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
  return <a ref={ref} href={href} className="cta-btn" onMouseMove={onMove} onMouseLeave={onLeave}>{children}</a>
}

function TiltCard({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`
  }, [])
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])
  return <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      const obj = { val: 0 }
      ScrollTrigger.create({
        trigger: ref.current, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target, duration: 1.5, ease: 'power2.out',
            onUpdate: () => { if (ref.current) ref.current.textContent = `${Math.round(obj.val)}${suffix}` }
          })
        }
      })
    })
    return () => ctx.revert()
  }, [target, suffix])
  return <span ref={ref}>0{suffix}</span>
}

export default function App() {
  const [hasWebGL, setHasWebGL] = useState(true)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const isReduced = useRef(false)

  useEffect(() => {
    setHasWebGL(detectWebGL())
    isReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!titleRef.current || isReduced.current) return
    const lines = titleRef.current.querySelectorAll('.title-line')
    const ctx = gsap.context(() => {
      gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.2 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!heroRef.current || isReduced.current) return
    const slogan = heroRef.current.querySelector('.hero-slogan')
    const cta = heroRef.current.querySelector('.cta-btn')
    const ctx = gsap.context(() => {
      gsap.fromTo([slogan, cta], { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', delay: 0.7 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (isReduced.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      })
      gsap.utils.toArray<HTMLElement>('.pillar-card').forEach((card, i) => {
        gsap.fromTo(card, { clipPath: 'inset(100% 0 0 0)', opacity: 0 }, { clipPath: 'inset(0% 0 0 0)', opacity: 1, duration: 0.7, delay: i * 0.1, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 85%', once: true } })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <SmoothScroll>
      <div className="app">
        <ScrollProgressBar />
        <CursorGlow />

        <section className="scene scene-hero" id="hero">
          <div className="canvas-container">
            {hasWebGL ? (<Suspense fallback={<LoadingSpinner />}><HeroScene /></Suspense>) : (<StaticFallback />)}
          </div>
          <div className="hero-overlay" ref={heroRef}>
            <h1 className="hero-title" ref={titleRef}>
              <span className="hero-line-mask"><span className="title-line">Trạm</span></span>
              <span className="hero-line-mask"><span className="title-line">Ghé</span></span>
              <span className="hero-line-mask"><span className="title-line">Tâm Hồn</span></span>
            </h1>
            <p className="hero-slogan">Không ôm sách, chỉ lấy ý sách mà dùng.</p>
            <MagneticCTA href="#pillars">Khám phá →</MagneticCTA>
          </div>
          <div className="section-fade-bottom" />
        </section>

        <section className="scene scene-pillars" id="pillars">
          <div className="canvas-container">
            {hasWebGL ? (<Suspense fallback={<LoadingSpinner />}><PillarScene /></Suspense>) : null}
          </div>
          <div className="pillars-content reveal">
            <h2><AnimatedCounter target={3} /> Trụ cột</h2>
            <div className="pillars-grid">
              <TiltCard className="pillar-card glass-card">
                <span className="pillar-icon">💰</span><h3>Tiền</h3>
                <p>Hiểu và làm chủ tiền khi mới kiếm ra — không để cuối tháng hết sạch.</p>
              </TiltCard>
              <TiltCard className="pillar-card glass-card">
                <span className="pillar-icon">🧠</span><h3>Hiểu con người</h3>
                <p>Vì sao mình hành xử vậy? Thế giới vận hành thế nào? Sapiens giải mã.</p>
              </TiltCard>
              <TiltCard className="pillar-card glass-card">
                <span className="pillar-icon">🔓</span><h3>Phá giới hạn</h3>
                <p>Tự do khỏi cái khuôn người khác đặt cho mình — đó là North Star.</p>
              </TiltCard>
            </div>
          </div>
          <div className="section-fade-bottom" />
        </section>

        <section className="scene scene-book" id="books">
          <div className="canvas-container">
            {hasWebGL ? (<Suspense fallback={<LoadingSpinner />}><BookScene /></Suspense>) : null}
          </div>
          <div className="book-content reveal">
            <h2>Cuốn đang giải mã</h2>
            <div className="book-card">
              <div className="book-info">
                <h3>Sapiens — Lược sử loài người</h3>
                <p className="book-author">Yuval Noah Harari</p>
                <p className="book-desc">70.000 năm lịch sử gói trong 1 cuốn. Mình không kể lại sách — mình lấy ý, ghép với đời thật của các bạn, để các bạn thấy: mọi thứ đang tin đều có thể đặt câu hỏi lại.</p>
                <p className="book-pair">📚 Ghép với: <strong>Tâm Lý Học Về Tiền</strong> (Morgan Housel)</p>
              </div>
            </div>
          </div>
          <div className="section-fade-bottom" />
        </section>

        <section className="scene scene-about" id="about">
          <div className="about-content reveal">
            <h2>Mình là ai?</h2>
            <p>18 tuổi. Đọc sách không phải vì thích — mà vì cần. Cần hiểu tiền chạy đi đâu, cần hiểu sao mình cứ lặp sai, cần phá cái khuôn người khác đặt cho mình.</p>
            <p>Kênh này là la bàn — không bán sách, chỉ chỉ đường: <strong>với tình huống của bạn, nên đọc cuốn nào, nghĩ hướng nào, làm cách nào.</strong></p>
            <div className="about-values">
              <span className="value-tag">Chân thật</span>
              <span className="value-tag">Chạm cảm xúc</span>
              <span className="value-tag">Thực chiến</span>
            </div>
          </div>
        </section>

        <footer className="site-footer reveal">
          <p>Trạm Ghé Tâm Hồn · Không ôm sách, chỉ lấy ý sách mà dùng.</p>
          <div className="social-links">
            <a href="https://www.tiktok.com/@tramghetamhon" target="_blank" rel="noopener">TikTok</a>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  )
}
