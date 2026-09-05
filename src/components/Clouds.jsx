import { useRef, useMemo, createRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A single cloud puff made of overlapping spheres.
 */
function CloudPuff({ startLat, startLon, orbitSpeed, scale, heightAboveSurface }) {
  const angle = useRef(startLon)

  // Random puff shape with 4-6 spheres
  const puffs = useMemo(() => {
    const count = 4 + Math.floor(Math.random() * 3)
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.3) * 0.6,
        (Math.random() - 0.5) * 0.8
      ),
      size: 0.4 + Math.random() * 0.5,
    }))
  }, [])

  const refs = useRef([])
  if (refs.current.length !== puffs.length) {
    refs.current = Array(puffs.length).fill().map((_, i) => refs.current[i] || createRef())
  }

  const euler = useMemo(() => new THREE.Euler(), [])
  const centerPos = useMemo(() => new THREE.Vector3(), [])
  const puffWorldPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    angle.current += orbitSpeed * delta

    // Position cloud on the globe surface using lat/lon like everything else
    const r = 50 + heightAboveSurface
    const lat = startLat + Math.sin(angle.current) * 0.1 // slight drift in latitude
    const lon = angle.current

    euler.set(lat, 0, lon, 'XYZ')
    centerPos.set(0, r + Math.sin(state.clock.elapsedTime * 0.5 + startLat) * 0.2, 0)
    
    // Convert spherical to cartesian
    for (let i = 0; i < puffs.length; i++) {
      if (!refs.current[i].current) continue
      
      // Calculate local position of puff relative to cloud center
      puffWorldPos.copy(puffs[i].pos).multiplyScalar(scale).add(centerPos)
      puffWorldPos.applyEuler(euler)
      
      refs.current[i].current.position.copy(puffWorldPos)
      refs.current[i].current.scale.setScalar(puffs[i].size * scale)
    }
  })

  return (
    <>
      {puffs.map((puff, i) => (
        <Instance key={i} ref={refs.current[i]} />
      ))}
    </>
  )
}

/**
 * A collection of clouds distributed across the globe surface.
 */
export function Clouds({ count = 16, isWinter = false }) {
  const clouds = useMemo(() => {
    const list = []
    let i = 0
    let attempts = 0
    while (list.length < count && attempts < count * 20) {
      attempts += 1
      const startLat = (Math.random() - 0.5) * 1.8
      const startLon = (Math.random() - 0.5) * Math.PI * 2
      // Keep village/spawn sky clear so clouds don't sit in the camera frustum
      if (Math.abs(startLat) < 0.35 && Math.abs(startLon) < 0.55) continue
      list.push({
        id: i++,
        startLat,
        startLon,
        orbitSpeed: 0.02 + Math.random() * 0.03,
        scale: 0.8 + Math.random() * 1.2,
        heightAboveSurface: 3.5 + Math.random() * 5,
      })
    }
    return list
  }, [count])

  const maxInstances = count * 7

  return (
    <group>
      <Instances limit={maxInstances} range={maxInstances}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial
          color={isWinter ? '#e2e8f0' : '#ffffff'}
          transparent
          opacity={0.7}
          roughness={1}
          depthWrite={false}
        />
        {clouds.map((cloud) => (
          <CloudPuff key={cloud.id} {...cloud} />
        ))}
      </Instances>
    </group>
  )
}
