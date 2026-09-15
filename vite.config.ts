import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@react-three')) return 'r3f'
          if (id.includes('three')) return 'three'
          if (id.includes('gsap')) return 'gsap'
        }
      }
    }
  }
})
