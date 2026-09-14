import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec3 navy = vec3(0.102, 0.102, 0.180);
    vec3 purple = vec3(0.15, 0.08, 0.25);
    vec3 darkBlue = vec3(0.06, 0.06, 0.15);
    
    float t = vUv.y + sin(uTime * 0.15 + vUv.x * 2.0) * 0.08;
    vec3 color = mix(darkBlue, navy, smoothstep(0.0, 0.5, t));
    color = mix(color, purple, smoothstep(0.3, 0.7, t) * 0.5);
    color = mix(color, navy, smoothstep(0.7, 1.0, t));
    
    gl_FragColor = vec4(color, 1.0);
  }
`

export default function GradientBg() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh position={[0, 0, -50]} scale={[200, 200, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}
