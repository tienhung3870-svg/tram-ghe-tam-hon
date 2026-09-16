import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingShape({ position, geometry, color, speed }: { position: [number, number, number], geometry: THREE.BufferGeometry, color: string, speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed
      meshRef.current.rotation.y += delta * speed * 1.2
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
    </mesh>
  )
}

/** Camera lerp: follows mouse ±3° for 2.5D parallax */
function ParallaxCamera() {
  useFrame((state) => {
    const { mouse, camera } = state
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.4, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.2, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

export default function PillarScene() {
  const icoGeo = new THREE.IcosahedronGeometry(1)
  const octaGeo = new THREE.OctahedronGeometry(1)
  const dodecaGeo = new THREE.DodecahedronGeometry(1)

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <ParallaxCamera />
      {/* Left: Money - Icosahedron */}
      <FloatingShape position={[-3, 0, 0]} geometry={icoGeo} color="#c9a87c" speed={0.2} />
      
      {/* Center: Understanding Humans - Octahedron */}
      <FloatingShape position={[0, 0, 0]} geometry={octaGeo} color="#c9a87c" speed={0.3} />
      
      {/* Right: Breaking Limits - Dodecahedron */}
      <FloatingShape position={[3, 0, 0]} geometry={dodecaGeo} color="#c9a87c" speed={0.25} />
    </Canvas>
  )
}
