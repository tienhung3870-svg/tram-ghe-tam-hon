import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { lenisInstance } from '../SmoothScroll'
import { siteContent } from '../content/site'
import './Marquee.css'

export default function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Danh sách chữ đọc từ site.ts: tên sách + tên trụ cột + slogan
  const marqueeItems = [
    ...siteContent.books.items.map(b => b.title),
    ...siteContent.pillars.items.map(p => p.title),
    siteContent.hero.slogan
  ]

  useEffect(() => {
    if (!containerRef.current) return
    let rafId: number
    const track = containerRef.current.querySelector('.marquee-track')
    if (!track) return

    let xPos = 0
    let direction = -1

    const render = () => {
      let speed = 1.5
      if (lenisInstance) {
        const velocity = lenisInstance.velocity || 0
        speed += Math.abs(velocity) * 0.1
        if (velocity > 0) direction = -1
        else if (velocity < 0) direction = 1
      }

      xPos += speed * direction

      if (xPos <= -50) xPos += 50
      if (xPos >= 0) xPos -= 50

      gsap.set(track, { xPercent: xPos })
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="marquee-container" ref={containerRef} aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-content">
          {marqueeItems.map((item, idx) => (
            <span key={idx} className="marquee-item">
              <span>{item}</span>
              <span className="marquee-bullet">•</span>
            </span>
          ))}
        </div>
        <div className="marquee-content">
          {marqueeItems.map((item, idx) => (
            <span key={`dup-${idx}`} className="marquee-item">
              <span>{item}</span>
              <span className="marquee-bullet">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
