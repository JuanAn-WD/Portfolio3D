import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _bg = new THREE.Color()

export function DayNightLighting({ cycleDuration = 90, isWinter = false, reducedMotion = false, active = true }) {
  const dirLightRef = useRef()
  const ambientRef = useRef()

  // Dawn / day / dusk / night — night is deep teal-ink, not purple AI
  const skyColors = isWinter
    ? [new THREE.Color('#8a9bb0'), new THREE.Color('#b8c4d4'), new THREE.Color('#6b8094'), new THREE.Color('#1a2a34')]
    : [new THREE.Color('#e8a04a'), new THREE.Color('#7eb8c9'), new THREE.Color('#d4783c'), new THREE.Color('#0d1f28')]

  const sunColors = isWinter
    ? [new THREE.Color('#f5e6c8'), new THREE.Color('#f8fafc'), new THREE.Color('#e8d4a8'), new THREE.Color('#7a9aaa')]
    : [new THREE.Color('#f0c14a'), new THREE.Color('#fff6e0'), new THREE.Color('#e8954a'), new THREE.Color('#5a8a8a')]

  const sunIntensities = isWinter ? [1.0, 1.4, 0.9, 0.3] : [1.2, 1.8, 1.0, 0.22]
  const ambientIntensities = isWinter ? [0.5, 0.7, 0.5, 0.25] : [0.5, 0.7, 0.4, 0.18]

  useFrame((state) => {
    if (!active) return
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
        color="#fff6e0"
        castShadow={active}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={80}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <hemisphereLight
        color={isWinter ? '#9eb0c0' : '#7eb8c9'}
        groundColor={isWinter ? '#3d4a45' : '#3d8f5a'}
        intensity={0.3}
      />
    </>
  )
}
