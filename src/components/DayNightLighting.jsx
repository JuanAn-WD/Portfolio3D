import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _bg = new THREE.Color()

export function DayNightLighting({ cycleDuration = 90, isWinter = false, reducedMotion = false }) {
  const dirLightRef = useRef()
  const ambientRef = useRef()

  const skyColors = isWinter
    ? [new THREE.Color('#7c8eb8'), new THREE.Color('#a5b4fc'), new THREE.Color('#818cf8'), new THREE.Color('#312e81')]
    : [new THREE.Color('#f59e0b'), new THREE.Color('#87CEEB'), new THREE.Color('#f97316'), new THREE.Color('#1e1b4b')]

  const sunColors = isWinter
    ? [new THREE.Color('#fde68a'), new THREE.Color('#f8fafc'), new THREE.Color('#fcd34d'), new THREE.Color('#6366f1')]
    : [new THREE.Color('#fbbf24'), new THREE.Color('#fffbeb'), new THREE.Color('#fb923c'), new THREE.Color('#4338ca')]

  const sunIntensities = isWinter ? [1.0, 1.4, 0.9, 0.3] : [1.2, 1.8, 1.0, 0.2]
  const ambientIntensities = isWinter ? [0.5, 0.7, 0.5, 0.25] : [0.5, 0.7, 0.4, 0.15]

  useFrame((state) => {
    const t = reducedMotion ? 0.28 : (state.clock.elapsedTime % cycleDuration) / cycleDuration
    const phase = t * 4
    const idx = Math.floor(phase) % 4
    const nextIdx = (idx + 1) % 4
    const blend = phase - Math.floor(phase)
    const smoothBlend = blend * blend * (3 - 2 * blend)

    if (dirLightRef.current) {
      dirLightRef.current.color.copy(sunColors[idx]).lerp(sunColors[nextIdx], smoothBlend)
      dirLightRef.current.intensity = THREE.MathUtils.lerp(sunIntensities[idx], sunIntensities[nextIdx], smoothBlend)
      const sunAngle = t * Math.PI * 2
      dirLightRef.current.position.set(Math.cos(sunAngle) * 20, Math.sin(sunAngle) * 15 + 12, 10)
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientIntensities[idx], ambientIntensities[nextIdx], smoothBlend)
    }

    _bg.copy(skyColors[idx]).lerp(skyColors[nextIdx], smoothBlend)
    state.scene.background = _bg
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
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={80}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight
        color={isWinter ? '#a5b4fc' : '#87ceeb'}
        groundColor={isWinter ? '#334155' : '#4ade80'}
        intensity={0.3}
      />
    </>
  )
}
