import React, { useRef } from 'react'
import { gsap } from '../lib/gsap'
import { useSplitReveal } from '../hooks/useSplitReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

export default function About() {
  const aboutTitleRef = useRef<HTMLHeadingElement>(null)
  const aboutTextRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useSplitReveal(aboutTitleRef)

  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // About text scrub
      if (aboutTextRef.current && !reducedMotion) {
        const lines = aboutTextRef.current.querySelectorAll('p')
        lines.forEach(line => {
          gsap.fromTo(line, 
            { opacity: 0.15 },
            {
              opacity: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: line,
                start: 'top 80%',
                end: 'bottom 60%',
                scrub: true
              }
            }
          )
        })
      }

      const revealEls = aboutRef.current?.querySelectorAll('.reveal')
      if (revealEls) {
        revealEls.forEach((el) => {
          gsap.fromTo(el,
            { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 50 },
            {
              opacity: 1, y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
          )
        })
      }
    })
    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section className="scene scene-about" id="about">
      <div className="about-content reveal" ref={aboutRef}>
        <h2 ref={aboutTitleRef}>{siteContent.about.title}</h2>
        <div ref={aboutTextRef}>
          {siteContent.about.paragraphs.map((p, idx) => (
            <p key={idx} dangerouslySetInnerHTML={{ __html: p }}></p>
          ))}
        </div>
        <div className="about-values">
          {siteContent.about.values.map(val => (
            <span key={val.id} className="value-tag">{val.label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
