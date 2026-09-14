import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Custom round particle texture via canvas */
function createParticleTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(245, 240, 232, 1)')    // cream center
  gradient.addColorStop(0.15, 'rgba(201, 168, 124, 0.8)') // gold ring
  gradient.addColorStop(0.4, 'rgba(201, 168, 124, 0.2)')  // soft glow
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')            // transparent edge
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function StarField({ count = 2000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const texture = useMemo(() => createParticleTexture(), [])

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200
      sz[i] = Math.random() * 3 + 0.5
    }
    return [pos, sz]
  }, [count])

  useFrame((_state, delta) => {
    if (!pointsRef.current) return
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= delta * (0.3 + sizes[i] * 0.2)
      if (posArray[i * 3 + 1] < -100) {
        posArray[i * 3 + 1] = 100
        posArray[i * 3] = (Math.random() - 0.5) * 200
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 200
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={3}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
