import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useSplitReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    // Don't animate if prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // Split text into words wrapped in spans
    const text = el.innerText
    const words = text.split(' ')
    el.innerHTML = ''
    
    words.forEach((word) => {
      const wordSpan = document.createElement('span')
      wordSpan.style.display = 'inline-block'
      wordSpan.style.overflow = 'hidden'
      wordSpan.style.verticalAlign = 'top'

      const innerSpan = document.createElement('span')
      innerSpan.style.display = 'inline-block'
      innerSpan.innerText = word + '\u00A0'
      innerSpan.className = 'reveal-word'
      
      wordSpan.appendChild(innerSpan)
      el.appendChild(wordSpan)
    })

    const wordElements = el.querySelectorAll('.reveal-word')
    
    const ctx = gsap.context(() => {
      gsap.fromTo(wordElements, 
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          }
        }
      )
    }, el)

    return () => {
      ctx.revert()
      // Restore original text on unmount if needed, though usually not required
      if (el) el.innerHTML = text
    }
  }, [ref])
}
