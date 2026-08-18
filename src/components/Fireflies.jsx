import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A single firefly particle that drifts and pulses on the globe surface.
 */
function Firefly({ startLat, startLon, speed, pulseSpeed, color, baseHeight }) {
  const ref = useRef()
  const offsetX = useMemo(() => Math.random() * Math.PI * 2, [])
  const offsetY = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    // Gentle drift around starting position
    ref.current.rotation.x = startLat + Math.sin(t * speed + offsetX) * 0.08
    ref.current.rotation.z = startLon + Math.cos(t * speed * 0.7 + offsetY) * 0.08

    // Pulse glow
    const pulse = (Math.sin(t * pulseSpeed + offsetX) + 1) / 2
    const innerMesh = ref.current.children[0].children[0]
    if (innerMesh && innerMesh.material) {
      innerMesh.material.emissiveIntensity = 0.5 + pulse * 2
      innerMesh.material.opacity = 0.4 + pulse * 0.6
    }

    // Gentle height variation
    ref.current.children[0].position.y = baseHeight + Math.sin(t * 1.5 + offsetY) * 0.3
  })

  return (
    <group ref={ref} rotation={[startLat, 0, startLon]}>
      <group position={[0, baseHeight, 0]}>
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Glow halo */}
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Fireflies / glowing particles spread across the entire globe.
 * Adds magical ambiance everywhere, not just in the village center.
 */
export function Fireflies({ count = 40, isWinter = false }) {
  const fireflies = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Distribute across the entire visible globe surface
      const inCenter = i < count * 0.4 // 40% near the center (village)
      const spread = inCenter ? 0.6 : 2.0

      return {
        id: i,
        startLat: (Math.random() - 0.5) * spread,
        startLon: (Math.random() - 0.5) * spread,
        speed: 0.2 + Math.random() * 0.4,
        pulseSpeed: 1.5 + Math.random() * 2,
        color: isWinter ? '#93c5fd' : (Math.random() > 0.5 ? '#fbbf24' : '#4ade80'),
        baseHeight: 50.3 + Math.random() * 2,
      }
    })
  }, [count, isWinter])

  return (
    <group>
      {fireflies.map((f) => (
        <Firefly key={f.id} {...f} />
      ))}
    </group>
  )
}
