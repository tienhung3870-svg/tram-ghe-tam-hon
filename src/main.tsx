import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!
const root = createRoot(container)

// Defer mounting app to requestIdleCallback to guarantee initial paint occurs first
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
} else {
  setTimeout(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }, 1)
}
