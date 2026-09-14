import { Suspense, lazy, useEffect, useState, useRef } from 'react'
import './App.css'
import SmoothScroll from './SmoothScroll'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Lazy load 3D scenes - fallback to static if WebGL unavailable
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

// Static fallback when WebGL is off
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

/** Scroll progress bar at top of page */
function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (!barRef.current) return
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      barRef.current.style.width = `${progress}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className="scroll-progress-bar" ref={barRef} />
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
              if (ref.current) {
                ref.current.textContent = `${Math.round(obj.val)}${suffix}`
              }
            }
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

  useEffect(() => {
    setHasWebGL(detectWebGL())
  }, [])

  // Scroll reveal animations for sections
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            }
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

        {/* SCENE 1: Hero — Book compass + stars + gradient shader bg */}
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
          <div className="hero-overlay reveal">
            <h1 className="hero-title">
              <span className="title-line">Trạm</span>
              <span className="title-line">Ghé</span>
              <span className="title-line">Tâm Hồn</span>
            </h1>
            <p className="hero-slogan">Không ôm sách, chỉ lấy ý sách mà dùng.</p>
            <a href="#pillars" className="cta-btn">Khám phá →</a>
          </div>
        </section>

        {/* SCENE 2: 3 Pillars — Tiền, Con người, Phá giới hạn */}
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
        </section>

        {/* SCENE 3: Book Showcase — Sapiens series */}
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
        </section>

        {/* SCENE 4: About — Who is Hùng */}
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

        {/* Footer */}
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
