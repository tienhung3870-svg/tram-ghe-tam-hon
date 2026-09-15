import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import './Cursor.css'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current
    const circle = circleRef.current
    if (!dot || !circle) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let circleX = mouseX
    let circleY = mouseY
    let rafId: number

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      gsap.to(dot, { x: mouseX, y: mouseY, duration: 0, ease: 'none' })
    }

    const onHover = () => {
      gsap.to(circle, { scale: 2.2, backgroundColor: 'rgba(201, 168, 124, 0.15)', borderColor: 'var(--gold)', duration: 0.3 })
      gsap.to(dot, { scale: 0, duration: 0.2 })
    }

    const onLeave = () => {
      gsap.to(circle, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(201, 168, 124, 0.4)', duration: 0.3 })
      gsap.to(dot, { scale: 1, duration: 0.2 })
    }

    window.addEventListener('mousemove', onMouseMove)

    const interactables = document.querySelectorAll('a, button, [data-cursor]')
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', onHover)
      el.addEventListener('mouseleave', onLeave)
    })

    const render = () => {
      circleX += (mouseX - circleX) * 0.15
      circleY += (mouseY - circleY) * 0.15
      gsap.set(circle, { x: circleX, y: circleY })
      rafId = requestAnimationFrame(render)
    }
    rafId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', onHover)
        el.removeEventListener('mouseleave', onLeave)
      })
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-circle" ref={circleRef} />
    </>
  )
}
