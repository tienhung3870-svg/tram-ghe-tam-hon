const fs = require('fs');

const code = `import { useRef, Suspense, lazy, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { heroProgress } from '../lib/scrollState'
import { useIsMobile } from '../hooks/useIsMobile'
import { useReducedMotion } from '../hooks/useReducedMotion'

const StarField = lazy(() => import('./StarField'))
const GradientBg = lazy(() => import('./GradientBg'))

function TickMarks() {
  const ticks = useMemo(() => {
    const items = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const isCardinal = i % 3 === 0
      items.push({
        angle,
        length: isCardinal ? 0.2 : 0.1,
        width: isCardinal ? 0.02 : 0.012,
        x: Math.cos(angle) * 1.35,
        z: Math.sin(angle) * 1.35,
      })
    }
    return items
  }, [])

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {ticks.map((t, i) => (
        <mesh key={i} position={[t.x, 0, t.z]} rotation={[0, 0, -t.angle]}>
          <boxGeometry args={[t.length, t.width, t.width]} />
          <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

function GlowRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.6, 0.08, 16, 100]} />
      <meshStandardMaterial
        color="#c9a87c"
        emissive="#c9a87c"
        emissiveIntensity={0.3}
        transparent
        opacity={0.15}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  )
}

function Compass() {
  const groupRef = useRef<THREE.Group>(null)
  const isReducedMotion = useReducedMotion()
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const currentProgress = heroProgress.current
    
    // Y spin based on hero progress
    const targetRotY = currentProgress * Math.PI
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1)
    
    // Float
    if (!isReducedMotion) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12
    }
    
    // Mouse tilt: max 8° ≈ 0.14 rad, lerp for smooth
    const px = state.pointer.x
    const py = state.pointer.y
    if (!isReducedMotion) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, py * 0.14, 0.05)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -px * 0.14, 0.05)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <GlowRing />
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.03, 16, 100]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.25} />
      </mesh>
      <TickMarks />
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.18, 1, 4]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.25} emissive="#c9a87c" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 1, 4]} />
        <meshStandardMaterial color="#f5f0e8" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.1} emissive="#c9a87c" emissiveIntensity={0.4} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#c9a87c" transparent opacity={0.08} emissive="#c9a87c" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function ParallaxCamera() {
  const isReducedMotion = useReducedMotion()
  
  useFrame((state) => {
    const { pointer, camera } = state
    
    // Camera retreats z by 1.5 based on hero progress
    const baseZ = 5
    const targetZ = baseZ + 1.5 * heroProgress.current
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
    
    if (!isReducedMotion) {
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.5, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.3, 0.05)
    }
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene() {
  const isMobile = useIsMobile()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always')

  useEffect(() => {
    if (!wrapperRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? 'always' : 'never')
    }, { threshold: 0 })
    
    observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <Canvas frameloop={frameloop} camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <GradientBg />
        </Suspense>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} color="#c9a87c" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#c9a87c" />
        <Environment preset="night" />
        <ParallaxCamera />
        <Suspense fallback={null}>
          <StarField count={isMobile ? 500 : 1500} />
        </Suspense>
        <Compass />
        
        {!isMobile && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.8} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
`

fs.writeFileSync('src/scenes/HeroScene.tsx', code);
