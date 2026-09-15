import { useRef, useState, useEffect } from 'react'
import { gsap, ScrollTrigger, Flip } from '../lib/gsap'
import { useIsMobile } from '../hooks/useIsMobile'
import { useReducedMotion } from '../hooks/useReducedMotion'
import './Books.css'

const booksData = [
  { id: 'b1', title: 'Sapiens', author: 'Yuval Noah Harari', desc: '70.000 năm lịch sử gói trong 1 cuốn.', pair: 'Tâm Lý Học Về Tiền', speed: 1 },
  { id: 'b2', title: 'Tâm Lý Học Về Tiền', author: 'Morgan Housel', desc: 'Sự giàu có không phải là những gì bạn thấy.', pair: 'Sapiens', speed: 0.85 },
  { id: 'b3', title: 'Atomic Habits', author: 'James Clear', desc: 'Thay đổi nhỏ, kết quả lớn.', pair: 'Tư Duy Nhanh Và Chậm', speed: 1.15 },
  { id: 'b4', title: 'Tư Duy Nhanh Và Chậm', author: 'Daniel Kahneman', desc: 'Hiểu về hai hệ thống tư duy.', pair: 'Atomic Habits', speed: 0.9 },
]

export default function Books() {
  const isMobile = useIsMobile()
  const isReducedMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeBook, setActiveBook] = useState<string | null>(null)

  useEffect(() => {
    if (isMobile || isReducedMotion || !sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      const track = trackRef.current!
      
      // Calculate scroll distance
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth)

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none'
      })

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
      })

      // Parallax for cards
      gsap.utils.toArray<HTMLElement>('.book-card-inner').forEach((card) => {
        const speed = parseFloat(card.dataset.speed || '1')
        gsap.to(card, {
          x: () => (window.innerWidth * 0.1) * (1 - speed),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
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
                      <p className="book-pair">📚 Ghép với: <strong>{book.pair}</strong></p>
                      <button className="close-btn" onClick={(e) => { e.stopPropagation(); closeBook(); }}>Đóng</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
