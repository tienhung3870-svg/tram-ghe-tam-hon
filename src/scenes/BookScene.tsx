import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function FloatingBook() {
  const bookRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!bookRef.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.scene-book',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate: (self) => {
          if (bookRef.current) {
            bookRef.current.rotation.y = self.progress * Math.PI * 2
          }
        }
      })
    })

    return () => ctx.revert()
  }, [])

  useFrame((state) => {
    if (bookRef.current) {
      bookRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group ref={bookRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.4]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.7} />
      </mesh>
      {/* Cover representation */}
      <mesh position={[0, 0, 0.201]} castShadow>
        <planeGeometry args={[1.9, 2.9]} />
        <meshStandardMaterial color="#c9a87c" roughness={0.3} metalness={0.2} />
      </mesh>
    </group>
  )
}

export default function BookScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows>
      <ambientLight intensity={0.4} />
      <spotLight 
        position={[2, 5, 2]} 
        angle={0.3} 
        penumbra={0.5} 
        intensity={2} 
        castShadow 
        color="#c9a87c" 
      />
      <FloatingBook />
    </Canvas>
  )
}
