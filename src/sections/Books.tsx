import React, { useRef, useState, useEffect, Suspense } from 'react'
import { gsap, ScrollTrigger, Flip } from '../lib/gsap'
import { useIsMobile } from '../hooks/useIsMobile'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useSplitReveal } from '../hooks/useSplitReveal'
import { siteContent } from '../content/site'
import './Books.css'

interface BooksProps {
  hasWebGL?: boolean
  BookScene?: React.LazyExoticComponent<any>
  LazyInView?: React.FC<{ children: React.ReactNode }>
  LoadingSpinner?: React.FC
}

export default function Books({ hasWebGL, BookScene, LazyInView, LoadingSpinner }: BooksProps) {
  const isMobile = useIsMobile()
  const isReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const booksTitleRef = useRef<HTMLHeadingElement>(null)
  const [activeBook, setActiveBook] = useState<string | null>(null)

  useSplitReveal(booksTitleRef)

  // Map site content to track items with parallax speed
  const booksData = siteContent.books.items.map((b, idx) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    desc: b.quote,
    pair: b.why || 'Tâm Lý Học Về Tiền',
    speed: 1 - (idx % 3) * 0.15
  }))

  useEffect(() => {
    if (isMobile || isReducedMotion || !sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth)

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none'
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 500)}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
      })

      gsap.utils.toArray<HTMLElement>('.book-card-inner').forEach((card) => {
        const speed = parseFloat(card.dataset.speed || '1')
        gsap.to(card, {
          x: () => (window.innerWidth * 0.1) * (1 - speed),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${Math.max(track.scrollWidth - window.innerWidth, 500)}`,
            scrub: 1,
            invalidateOnRefresh: true
          }
        })
      })
    })

    return () => ctx.revert()
  }, [isMobile, isReducedMotion])

  const handleBookClick = (id: string) => {
    if (activeBook === id) return
    const state = Flip.getState('.book-card-wrap, .book-card-inner, .book-detail')
    setActiveBook(id)
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        absolute: true,
        nested: true
      })
    })
  }

  const closeBook = () => {
    if (!activeBook) return
    const state = Flip.getState('.book-card-wrap, .book-card-inner, .book-detail')
    setActiveBook(null)
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        absolute: true,
        nested: true
      })
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBook()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeBook])

  return (
    <section className="scene scene-book" id="books" ref={sectionRef}>
      {hasWebGL && BookScene && LazyInView && LoadingSpinner && (
        <div className="canvas-container" aria-hidden="true" style={{ opacity: 0.4 }}>
          <Suspense fallback={<LoadingSpinner />}>
            <LazyInView><BookScene /></LazyInView>
          </Suspense>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <h2 ref={booksTitleRef} style={{ color: 'var(--gold)', fontSize: '2.25rem', marginBottom: '1rem' }}>
            {siteContent.books.title}
          </h2>
        </div>

        <div className="book-track-container">
          <div className="book-track" ref={trackRef}>
            {booksData.map((book) => {
              const isActive = activeBook === book.id
              return (
                <div
                  key={book.id}
                  className={`book-card-wrap ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleBookClick(book.id)}
                >
                  <div
                    className="book-card-inner"
                    data-speed={book.speed}
                    data-flip-id={`book-${book.id}`}
                  >
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p className="book-author">{book.author}</p>
                      <p className="book-desc">{book.desc}</p>
                    </div>

                    {isActive && (
                      <div className="book-detail">
                        <p className="book-pair">{siteContent.books.pairText} <strong>{book.pair}</strong></p>
                        <button className="close-btn" onClick={(e) => { e.stopPropagation(); closeBook(); }}>Đóng</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="section-fade-bottom" />
    </section>
  )
}
