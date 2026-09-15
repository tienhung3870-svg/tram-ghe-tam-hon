import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { lenisInstance } from '../SmoothScroll'
import './Marquee.css'

export default function Marquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      const track = containerRef.current!.querySelector('.marquee-track')
      
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
        
        // reset position for infinite loop (assuming duplicate content)
        // simple approach for infinite scroll of 2 identical blocks
        if (xPos <= -50) xPos += 50
        if (xPos >= 0) xPos -= 50
        
        gsap.set(track, { xPercent: xPos })
        requestAnimationFrame(render)
      }
      requestAnimationFrame(render)
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="marquee-container" ref={containerRef}>
      <div className="marquee-track">
        <div className="marquee-content">
          <span>Tâm Lý Học Về Tiền</span>
          <span>•</span>
          <span>Sapiens</span>
          <span>•</span>
          <span>Atomic Habits</span>
          <span>•</span>
          <span>Tư Duy Nhanh Và Chậm</span>
          <span>•</span>
        </div>
        <div className="marquee-content">
          <span>Tâm Lý Học Về Tiền</span>
          <span>•</span>
          <span>Sapiens</span>
          <span>•</span>
          <span>Atomic Habits</span>
          <span>•</span>
          <span>Tư Duy Nhanh Và Chậm</span>
          <span>•</span>
        </div>
      </div>
    </div>
  )
}
