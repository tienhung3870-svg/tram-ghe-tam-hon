import { Suspense, lazy, useEffect, useState, useRef, useCallback } from 'react'
import './App.css'
import SmoothScroll from './SmoothScroll'
import { gsap, ScrollTrigger } from './lib/gsap'


// Lazy load 3D scenes
const HeroScene = lazy(() => import('./scenes/HeroScene'))
const BookScene = lazy(() => import('./scenes/BookScene'))
const PillarScene = lazy(() => import('./scenes/PillarScene'))

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

function StaticFallback() {
  return (
    <div className="fallback-hero">
      <div className="fallback-gradient" />
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>Đang tải...</p>
    </div>
  )
}

/** Scroll progress bar */
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      barRef.current.style.width = `${docHeight > 0 ? (scrollTop / docHeight) * 100 : 0}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return <div className="scroll-progress-bar" ref={barRef} />
}

/** Cursor glow that follows mouse */
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: MouseEvent) => {
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`
    }
  }, [])
  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [onMove])
  return <div className="cursor-glow" ref={glowRef} />
}

/** Animated number counter */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
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

/** Stagger text reveal for hero title */
function useStaggerReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return
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
  }, [ref])
}

/** Stagger reveal for slogan + CTA */
function useHeroContentReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return
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
  }, [ref])
}

export default function App() {
  const [hasWebGL, setHasWebGL] = useState(true)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHasWebGL(detectWebGL())
  }, [])

  // Hero text stagger
  useStaggerReveal(titleRef)
  useHeroContentReveal(heroRef)

  // Scroll reveal for sections
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        )
      })

      // Stagger pillar cards
      gsap.utils.toArray<HTMLElement>('.pillar-card').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.7,
            delay: i * 0.15,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true }
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <SmoothScroll>
      <div className="app">
        <ScrollProgressBar />
        <CursorGlow />

        {/* HERO */}
        <section className="scene scene-hero" id="hero">
          <div className="canvas-container">
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
              <span className="title-line">Trạm</span>
              <span className="title-line">Ghé</span>
              <span className="title-line">Tâm Hồn</span>
            </h1>
            <p className="hero-slogan">Không ôm sách, chỉ lấy ý sách mà dùng.</p>
            <a href="#pillars" className="cta-btn">Khám phá →</a>
          </div>
          <div className="section-fade-bottom" />
        </section>

        {/* PILLARS */}
        <section className="scene scene-pillars" id="pillars">
          <div className="canvas-container">
            {hasWebGL ? (
              <Suspense fallback={<LoadingSpinner />}>
                <PillarScene />
              </Suspense>
            ) : null}
          </div>
          <div className="pillars-content reveal">
            <h2><AnimatedCounter target={3} /> Trụ cột</h2>
            <div className="pillars-grid">
              <div className="pillar-card glass-card">
                <span className="pillar-icon">💰</span>
                <h3>Tiền</h3>
                <p>Hiểu và làm chủ tiền khi mới kiếm ra — không để cuối tháng hết sạch.</p>
              </div>
              <div className="pillar-card glass-card">
                <span className="pillar-icon">🧠</span>
                <h3>Hiểu con người</h3>
                <p>Vì sao mình hành xử vậy? Thế giới vận hành thế nào? Sapiens giải mã.</p>
              </div>
              <div className="pillar-card glass-card">
                <span className="pillar-icon">🔓</span>
                <h3>Phá giới hạn</h3>
                <p>Tự do khỏi cái khuôn người khác đặt cho mình — đó là North Star.</p>
              </div>
            </div>
          </div>
          <div className="section-fade-bottom" />
        </section>

        {/* BOOK */}
        <section className="scene scene-book" id="books">
          <div className="canvas-container">
            {hasWebGL ? (
              <Suspense fallback={<LoadingSpinner />}>
                <BookScene />
              </Suspense>
            ) : null}
          </div>
          <div className="book-content reveal">
            <h2>Cuốn đang giải mã</h2>
            <div className="book-card">
              <div className="book-info">
                <h3>Sapiens — Lược sử loài người</h3>
                <p className="book-author">Yuval Noah Harari</p>
                <p className="book-desc">
                  70.000 năm lịch sử gói trong 1 cuốn. Mình không kể lại sách —
                  mình lấy ý, ghép với đời thật của các bạn, để các bạn thấy:
                  mọi thứ đang tin đều có thể đặt câu hỏi lại.
                </p>
                <p className="book-pair">
                  📚 Ghép với: <strong>Tâm Lý Học Về Tiền</strong> (Morgan Housel)
                </p>
              </div>
            </div>
          </div>
          <div className="section-fade-bottom" />
        </section>

        {/* ABOUT */}
        <section className="scene scene-about" id="about">
          <div className="about-content reveal">
            <h2>Mình là ai?</h2>
            <p>
              18 tuổi. Đọc sách không phải vì thích — mà vì cần. Cần hiểu tiền chạy đi đâu,
              cần hiểu sao mình cứ lặp sai, cần phá cái khuôn người khác đặt cho mình.
            </p>
            <p>
              Kênh này là la bàn — không bán sách, chỉ chỉ đường:
              <strong> với tình huống của bạn, nên đọc cuốn nào, nghĩ hướng nào, làm cách nào.</strong>
            </p>
            <div className="about-values">
              <span className="value-tag">Chân thật</span>
              <span className="value-tag">Chạm cảm xúc</span>
              <span className="value-tag">Thực chiến</span>
            </div>
          </div>
        </section>

        {/* FOOTER */}
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
