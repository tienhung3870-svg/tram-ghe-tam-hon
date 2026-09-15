import React, { useRef, Suspense } from 'react'
import { gsap } from '../lib/gsap'
import { useSplitReveal } from '../hooks/useSplitReveal'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { siteContent } from '../content/site'

interface BooksProps {
  hasWebGL: boolean
  BookScene: React.LazyExoticComponent<any>
  LazyInView: React.FC<{children: React.ReactNode}>
  LoadingSpinner: React.FC
}

export default function Books({ hasWebGL, BookScene, LazyInView, LoadingSpinner }: BooksProps) {
  const booksTitleRef = useRef<HTMLHeadingElement>(null)
  const booksRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useSplitReveal(booksTitleRef)

  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const revealEls = booksRef.current?.querySelectorAll('.reveal')
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
    <section className="scene scene-book" id="books">
      <div className="canvas-container" aria-hidden="true">
        {hasWebGL ? (
          <Suspense fallback={<LoadingSpinner />}>
            <LazyInView><BookScene /></LazyInView>
          </Suspense>
        ) : null}
      </div>
      <div className="book-content reveal" ref={booksRef}>
        <h2 ref={booksTitleRef}>{siteContent.books.title}</h2>
        <div className="book-card">
          {siteContent.books.items.length > 0 && (
            <div className="book-info">
              <h3>{siteContent.books.items[0].title}</h3>
              <p className="book-author">{siteContent.books.items[0].author}</p>
              <p className="book-desc">{siteContent.books.items[0].quote}</p>
              {siteContent.books.items[0].why && (
                <p className="book-pair">
                  {siteContent.books.pairText} <strong>{siteContent.books.items[0].why}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="section-fade-bottom" />
    </section>
  )
}
