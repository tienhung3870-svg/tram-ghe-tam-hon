import { useRef, Suspense, lazy } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const StarField = lazy(() => import('./StarField'))
const GradientBg = lazy(() => import('./GradientBg'))

function Compass() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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
      {/* Compass Needle */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.2, 1, 4]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 1, 4]} />
        <meshStandardMaterial color="#f5f0e8" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Center Pivot */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#c9a87c" metalness={0.9} roughness={0.1} />
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
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#c9a87c" />
      <ParallaxCamera />
      {/* Custom star particles replacing drei Stars */}
      <Suspense fallback={null}>
        <StarField count={1500} />
      </Suspense>
      <Compass />
    </Canvas>
  )
}
