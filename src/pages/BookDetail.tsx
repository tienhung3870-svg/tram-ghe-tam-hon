import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { siteContent } from '../content/site'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const book = siteContent.books.items.find((b) => b.id === id)

  if (!book) {
    return (
      <div
        className="not-found-page"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a2e',
          color: '#f5f0e8',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: '4rem', color: '#c9a87c', margin: '0 0 1rem' }}>404</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Không tìm thấy cuốn sách này.</p>
        <Link
          to="/"
          className="btn-home"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#c9a87c',
            color: '#1a1a2e',
            textDecoration: 'none',
            fontWeight: 'bold',
            borderRadius: '2rem'
          }}
        >
          ← Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div
      className="book-detail-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#f5f0e8',
        padding: '4rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ maxWidth: '720px', width: '100%' }}>
        <Link
          to="/"
          className="btn-back"
          style={{
            color: '#c9a87c',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}
        >
          ← Về trang chủ
        </Link>

        <h1 style={{ fontSize: '2.5rem', color: '#c9a87c', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          {book.title}
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
          Tác giả: <strong>{book.author}</strong>
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(201, 168, 124, 0.25)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          <h3 style={{ color: '#c9a87c', marginTop: 0 }}>Góc nhìn & Trích dẫn</h3>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>{book.quote}</p>
          {book.why && (
            <p style={{ marginTop: '1.5rem', color: '#c9a87c' }}>
              💡 <em>{book.why}</em>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
