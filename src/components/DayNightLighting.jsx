import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Smooth day/night cycle lighting system.
 * Cycles through dawn → day → dusk → night over a configurable period.
 * Controls directional light color/intensity, ambient light, and background color.
 */
export function DayNightLighting({ cycleDuration = 90, isWinter = false }) {
  const dirLightRef = useRef()
  const ambientRef = useRef()

  // Color stops for the cycle
  const skyColors = isWinter
    ? [
        new THREE.Color('#7c8eb8'), // dawn
        new THREE.Color('#a5b4fc'), // day
        new THREE.Color('#818cf8'), // dusk
        new THREE.Color('#312e81'), // night
      ]
    : [
        new THREE.Color('#f59e0b'), // dawn  - warm orange
        new THREE.Color('#87CEEB'), // day   - sky blue
        new THREE.Color('#f97316'), // dusk  - deep orange
        new THREE.Color('#1e1b4b'), // night - deep indigo
      ]

  const sunColors = isWinter
    ? [
        new THREE.Color('#fde68a'),
        new THREE.Color('#f8fafc'),
        new THREE.Color('#fcd34d'),
        new THREE.Color('#6366f1'),
      ]
    : [
        new THREE.Color('#fbbf24'), // dawn
        new THREE.Color('#fffbeb'), // day
        new THREE.Color('#fb923c'), // dusk
        new THREE.Color('#4338ca'), // night
      ]

  const sunIntensities = isWinter
    ? [1.0, 1.4, 0.9, 0.3]
    : [1.2, 1.8, 1.0, 0.2]

  const ambientIntensities = isWinter
    ? [0.5, 0.7, 0.5, 0.25]
    : [0.5, 0.7, 0.4, 0.15]

  useFrame((state) => {
    const t = (state.clock.elapsedTime % cycleDuration) / cycleDuration
    const phase = t * 4 // 0-4 mapping to 4 phases
    const idx = Math.floor(phase) % 4
    const nextIdx = (idx + 1) % 4
    const blend = phase - Math.floor(phase)

    // Smooth interpolation between phases
    const smoothBlend = blend * blend * (3 - 2 * blend) // smoothstep

    // Update directional light
    if (dirLightRef.current) {
      dirLightRef.current.color.copy(sunColors[idx]).lerp(sunColors[nextIdx], smoothBlend)
      dirLightRef.current.intensity = THREE.MathUtils.lerp(sunIntensities[idx], sunIntensities[nextIdx], smoothBlend)

      // Rotate sun position
      const sunAngle = t * Math.PI * 2
      dirLightRef.current.position.set(
        Math.cos(sunAngle) * 20,
        Math.sin(sunAngle) * 15 + 12,
        10
      )
    }

    // Update ambient light
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientIntensities[idx], ambientIntensities[nextIdx], smoothBlend)
    }

    // Update background
    const bg = skyColors[idx].clone().lerp(skyColors[nextIdx], smoothBlend)
    state.scene.background = bg
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.7} color="#ffffff" />
      <directionalLight
        ref={dirLightRef}
        position={[14, 22, 10]}
        intensity={1.8}
        color="#fffbeb"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Fill light from below to prevent total darkness at night */}
      <hemisphereLight
        color={isWinter ? '#a5b4fc' : '#87ceeb'}
        groundColor={isWinter ? '#334155' : '#4ade80'}
        intensity={0.3}
      />
    </>
  )
}
