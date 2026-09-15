import { useState, useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { gsap, ScrollTrigger } from '../lib/gsap'
import './Preloader.css'

export default function Preloader() {
  const { progress } = useProgress()
  const [mounted, setMounted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (progress >= 100) {
      const ctx = gsap.context(() => {
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
          delay: 0.2,
          onComplete: () => {
            setMounted(false)
            ScrollTrigger.refresh()
          }
        })
      })
      return () => ctx.revert()
    }
  }, [progress])

  // Safety timer so preloader never blocks rendering if no assets are tracked
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(false)
      ScrollTrigger.refresh()
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  return (
    <div className="preloader" ref={containerRef} aria-hidden="true">
      <div className="preloader-content">
        <div className="preloader-number">{Math.round(progress)}%</div>
        <div className="preloader-bar">
          <div className="preloader-bar-inner" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
