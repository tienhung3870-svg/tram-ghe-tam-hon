import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import BookDetail from './pages/BookDetail.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sach/:id" element={<BookDetail />} />
        <Route path="*" element={<BookDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
