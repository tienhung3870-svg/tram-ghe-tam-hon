import { useRef, Suspense, lazy, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StarField = lazy(() => import('./StarField'))
const GradientBg = lazy(() => import('./GradientBg'))

/** Compass tick marks — 12 small cylinders around the ring */
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
          <meshStandardMaterial color="#c9a87c" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}


/** Glow ring — slightly transparent torus with emissive */
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
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer glow ring */}
      <GlowRing />
      {/* Outer Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inner Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.03, 16, 100]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tick Marks */}
      <TickMarks />
      {/* Compass Needle — North (gold) */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.18, 1, 4]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.8} roughness={0.2} emissive="#c9a87c" emissiveIntensity={0.15} />
      </mesh>
      {/* Compass Needle — South (cream) */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 1, 4]} />
        <meshStandardMaterial color="#f5f0e8" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Center Pivot — glowing */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial 
          color="#c9a87c" 
          metalness={0.9} 
          roughness={0.1} 
          emissive="#c9a87c"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color="#c9a87c"
          transparent
          opacity={0.08}
          emissive="#c9a87c"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

/** Camera lerp: follows mouse ±3° for 2.5D parallax depth effect */
function ParallaxCamera() {
  useFrame((state) => {
    const { mouse, camera } = state
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.5, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.3, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      {/* Gradient background shader */}
      <Suspense fallback={null}>
        <GradientBg />
      </Suspense>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#c9a87c" />
      <pointLight position={[0, 0, 3]} intensity={0.5} color="#c9a87c" />
      <ParallaxCamera />
      {/* Custom star particles */}
      <Suspense fallback={null}>
        <StarField count={1500} />
      </Suspense>
      <Compass />
    </Canvas>
  )
}
