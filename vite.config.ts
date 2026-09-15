import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('@react-three/drei')) return 'r3f-drei'
          if (id.includes('@react-three/fiber')) return 'r3f-core'
          if (id.includes('three')) return 'three'
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('lenis')) return 'lenis'
        }
      }
    }
  }
})
