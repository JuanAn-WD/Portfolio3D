import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

function Firefly({ startLat, startLon, speed, pulseSpeed, color, baseHeight, reducedMotion }) {
  const ref = useRef()
  const offsetX = useMemo(() => Math.random() * Math.PI * 2, [])
  const offsetY = useMemo(() => Math.random() * Math.PI * 2, [])
  const euler = useMemo(() => new THREE.Euler(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    if (!ref.current) return
    const t = reducedMotion ? offsetX : state.clock.elapsedTime
    const lat = startLat + Math.sin(t * speed + offsetX) * 0.08
    const lon = startLon + Math.cos(t * speed * 0.7 + offsetY) * 0.08
    const height = baseHeight + Math.sin(t * 1.5 + offsetY) * 0.3
    euler.set(lat, 0, lon, 'XYZ')
    pos.set(0, height, 0).applyEuler(euler)
    ref.current.position.copy(pos)
    const pulse = reducedMotion ? 0.7 : (Math.sin(t * pulseSpeed + offsetX) + 1) / 2
    ref.current.scale.setScalar(0.5 + pulse * 1.0)
  })

  return <Instance ref={ref} color={color} />
}

export function Fireflies({ count = 24, isWinter = false, reducedMotion = false }) {
  const fireflies = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const inCenter = i < count * 0.4
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
    <Instances limit={count} range={count}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} toneMapped={false} />
      {fireflies.map((f) => (
        <Firefly key={f.id} reducedMotion={reducedMotion} {...f} />
      ))}
    </Instances>
  )
}
