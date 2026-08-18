import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A single cloud puff made of overlapping spheres.
 * Uses spherical positioning to orbit around the globe surface at various latitudes,
 * not just along the equator.
 */
function CloudPuff({ startLat, startLon, orbitSpeed, scale, heightAboveSurface, orbitAxis }) {
  const groupRef = useRef()
  const angle = useRef(startLon)

  // Random puff shape with 4-6 spheres
  const puffs = useMemo(() => {
    const count = 4 + Math.floor(Math.random() * 3)
    return Array.from({ length: count }, () => ({
      pos: [
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.3) * 0.6,
        (Math.random() - 0.5) * 0.8,
      ],
      size: 0.4 + Math.random() * 0.5,
    }))
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    angle.current += orbitSpeed * delta

    // Position cloud on the globe surface using lat/lon like everything else
    const r = 50 + heightAboveSurface
    const lat = startLat + Math.sin(angle.current) * 0.1 // slight drift in latitude
    const lon = angle.current

    // Convert spherical to cartesian (matching the globe's coordinate system)
    groupRef.current.rotation.x = lat
    groupRef.current.rotation.z = lon

    // Gentle bobbing
    groupRef.current.children[0].position.y = r + Math.sin(state.clock.elapsedTime * 0.5 + startLat) * 0.2
  })

  return (
    <group ref={groupRef} rotation={[startLat, 0, startLon]}>
      <group position={[0, 50 + heightAboveSurface, 0]} scale={scale}>
        {puffs.map((puff, i) => (
          <mesh key={i} position={puff.pos}>
            <sphereGeometry args={[puff.size, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              roughness={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/**
 * A collection of clouds distributed across the globe surface.
 * They orbit at various latitudes and altitudes, visible from every angle.
 */
export function Clouds({ count = 20, isWinter = false }) {
  const clouds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startLat: (Math.random() - 0.5) * 1.8,  // spread across many latitudes
      startLon: (Math.random() - 0.5) * Math.PI * 2,
      orbitSpeed: 0.02 + Math.random() * 0.03,
      scale: 0.8 + Math.random() * 1.4,
      heightAboveSurface: 1.5 + Math.random() * 4,  // float above the ground
    }))
  }, [count])

  return (
    <group>
      {clouds.map((cloud) => (
        <CloudPuff key={cloud.id} {...cloud} />
      ))}
    </group>
  )
}
