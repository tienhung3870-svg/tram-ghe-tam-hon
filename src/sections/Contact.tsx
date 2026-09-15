import React, { useState } from 'react'
import { siteContent } from '../content/site'
import { useLenis } from 'lenis/react'
import './Contact.css'

export default function Contact() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const lenis = useLenis()

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setStatus('error')
      setErrorMsg('Email không hợp lệ. Vui lòng kiểm tra lại.')
      return
    }

    if (!siteContent.contact.formEndpoint) {
      // No endpoint configured, simulate success but actually do nothing
      setStatus('success')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch(siteContent.contact.formEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStatus('success')
        setEmail('')
      } else {
        throw new Error('Lỗi server')
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg('Có lỗi xảy ra khi gửi. Vui lòng thử lại sau.')
    }
  }

  const scrollToTop = () => {
    lenis?.scrollTo(0, { duration: 1.5 })
  }

  return (
    <section className="scene scene-contact" id="contact">
      <div className="contact-content reveal">
        <h2>{siteContent.contact.title}</h2>
        <p>{siteContent.contact.callToAction}</p>
        
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status === 'error') setStatus('idle')
              }}
              disabled={status === 'loading' || status === 'success'}
              required
            />
            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
            >
              {!siteContent.contact.formEndpoint 
                ? 'Sắp mở' 
                : status === 'loading' 
                  ? 'Đang gửi...' 
                  : status === 'success' 
                    ? 'Đã đăng ký ✓' 
                    : 'Đăng ký'}
            </button>
          </div>
          <div aria-live="polite" className="form-status">
            {status === 'error' && <p className="error-text">{errorMsg}</p>}
            {status === 'success' && <p className="success-text">Cảm ơn bạn đã đăng ký!</p>}
          </div>
        </form>

        <div className="social-buttons">
          {siteContent.contact.socialLinks.tiktok && (
            <a href={siteContent.contact.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-btn">TikTok</a>
          )}
          {siteContent.contact.socialLinks.youtube && (
            <a href={siteContent.contact.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-btn">YouTube</a>
          )}
          {siteContent.contact.socialLinks.facebook && (
            <a href={siteContent.contact.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">Facebook</a>
          )}
        </div>
      </div>

      <footer className="site-footer">
        <p>© {siteContent.footer.year} {siteContent.footer.brand} · {siteContent.footer.slogan}</p>
        <button className="back-to-top" onClick={scrollToTop} aria-label="Lên đầu trang">
          ↑ Lên đầu trang
        </button>
      </footer>
    </section>
  )
}
