import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Prop } from './Prop'

/**
 * A single rising smoke puff; loops through a fade/rise cycle
 * using its own time offset.
 */
function SmokeParticle({ baseY, index }) {
  const ref = useRef()
  const offset = useMemo(() => Math.random() * 10, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = ((state.clock.elapsedTime + offset) % 4) / 4 // ciclo de 4s
    ref.current.position.y = baseY + t * 2.2
    ref.current.scale.setScalar(0.15 + t * 0.35)
    ref.current.material.opacity = 0.5 * (1 - t)
  })

  return (
    <mesh ref={ref} position={[Math.sin(index) * 0.1, baseY, Math.cos(index) * 0.1]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#e2e8f0" transparent opacity={0.4} />
    </mesh>
  )
}

/**
 * A chimney prop that continuously emits looping smoke particles above it.
 */
export function Chimney({ path = "/models/Edifices/chimney-medium.glb", position = [0, 0, 0], scale = 1, count = 3 }) {
  return (
    <group position={position}>
      <Prop path={path} scale={scale} />
      <group position={[0, 1.2 * scale, 0]}>
        {Array.from({ length: count }, (_, i) => <SmokeParticle key={i} baseY={0} index={i} />)}
      </group>
    </group>
  )
}
