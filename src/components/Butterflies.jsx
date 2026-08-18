import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A single butterfly with flapping wing geometry.
 */
function Butterfly({ startPos, color, speed, area }) {
  const groupRef = useRef()
  const wing1Ref = useRef()
  const wing2Ref = useRef()

  const offset = useMemo(() => Math.random() * Math.PI * 2, [])
  const target = useRef(new THREE.Vector3(
    startPos[0] + (Math.random() - 0.5) * area,
    startPos[1] + Math.random() * 1.5,
    startPos[2] + (Math.random() - 0.5) * area
  ))
  const timer = useRef(0)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Flap wings
    const flapAngle = Math.sin(state.clock.elapsedTime * 12 + offset) * 0.7
    if (wing1Ref.current) wing1Ref.current.rotation.y = flapAngle
    if (wing2Ref.current) wing2Ref.current.rotation.y = -flapAngle

    // Wander to new target periodically
    timer.current -= delta
    if (timer.current <= 0) {
      target.current.set(
        startPos[0] + (Math.random() - 0.5) * area,
        startPos[1] + 0.5 + Math.random() * 2,
        startPos[2] + (Math.random() - 0.5) * area
      )
      timer.current = 2 + Math.random() * 3
    }

    // Smooth movement towards target
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, target.current.x, speed, delta)
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, target.current.y, speed, delta)
    groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, target.current.z, speed, delta)

    // Add gentle wave to height
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + offset) * 0.05

    // Face direction of movement
    const dir = target.current.clone().sub(groupRef.current.position)
    if (dir.length() > 0.01) {
      groupRef.current.rotation.y = Math.atan2(dir.x, dir.z)
    }
  })

  return (
    <group ref={groupRef} position={startPos}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Left wing */}
      <group position={[0.01, 0, 0]} ref={wing1Ref}>
        <mesh position={[0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.08]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      </group>
      {/* Right wing */}
      <group position={[-0.01, 0, 0]} ref={wing2Ref}>
        <mesh position={[-0.06, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.08]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * Butterflies spread across the globe near vegetation areas.
 * Concentrated more densely near the village but also found in the forests.
 */
export function Butterflies({ count = 16, isWinter = false }) {
  const colors = ['#f472b6', '#a78bfa', '#fbbf24', '#fb923c', '#34d399', '#60a5fa']

  const butterflies = useMemo(() => {
    if (isWinter) return []
    return Array.from({ length: count }, (_, i) => {
      // 50% near village center, 50% spread across globe forests
      const inCenter = i < count * 0.5
      const spread = inCenter ? 0.5 : 1.8
      const lat = (Math.random() - 0.5) * spread
      const lon = (Math.random() - 0.5) * spread
      return {
        id: i,
        lat,
        lon,
        color: colors[i % colors.length],
        speed: 1.5 + Math.random() * 1.5,
        area: 2 + Math.random() * 2,
      }
    })
  }, [count, isWinter])

  if (isWinter) return null

  return (
    <group>
      {butterflies.map((b) => (
        <group key={b.id} rotation={[b.lat, 0, b.lon]}>
          <group position={[0, 50, 0]}>
            <Butterfly
              startPos={[0, 0.5, 0]}
              color={b.color}
              speed={b.speed}
              area={b.area}
            />
          </group>
        </group>
      ))}
    </group>
  )
}
