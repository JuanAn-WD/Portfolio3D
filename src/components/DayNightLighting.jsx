import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _bg = new THREE.Color()

export function DayNightLighting({
  cycleDuration = 90,
  isWinter = false,
  reducedMotion = false,
  active = true,
  anchorRef,
  shadowSize = 42,
}) {
  const dirLightRef = useRef()
  const ambientRef = useRef()
  const targetRef = useRef()

  const skyColors = isWinter
    ? [new THREE.Color('#8a9bb0'), new THREE.Color('#b8c4d4'), new THREE.Color('#6b8094'), new THREE.Color('#1a2a34')]
    : [new THREE.Color('#e8a04a'), new THREE.Color('#7eb8c9'), new THREE.Color('#d4783c'), new THREE.Color('#0d1f28')]

  const sunColors = isWinter
    ? [new THREE.Color('#f5e6c8'), new THREE.Color('#f8fafc'), new THREE.Color('#e8d4a8'), new THREE.Color('#7a9aaa')]
    : [new THREE.Color('#f0c14a'), new THREE.Color('#fff6e0'), new THREE.Color('#e8954a'), new THREE.Color('#5a8a8a')]

  const sunIntensities = isWinter ? [1.0, 1.4, 0.9, 0.3] : [1.2, 1.8, 1.0, 0.22]
  const ambientIntensities = isWinter ? [0.5, 0.7, 0.5, 0.25] : [0.5, 0.7, 0.4, 0.18]

  useLayoutEffect(() => {
    if (dirLightRef.current && targetRef.current) {
      dirLightRef.current.target = targetRef.current
    }
  }, [])

  useFrame((state) => {
    if (!active) return
    const t = reducedMotion ? 0.22 : ((state.clock.elapsedTime / cycleDuration) + 0.2) % 1
    const phase = t * 4
    const idx = Math.floor(phase) % 4
    const nextIdx = (idx + 1) % 4
    const blend = phase - Math.floor(phase)
    const smoothBlend = blend * blend * (3 - 2 * blend)
    const anchor = anchorRef?.current
    const ax = anchor?.x || 0
    const az = anchor?.z || 0

    if (dirLightRef.current) {
      const sunAngle = t * Math.PI * 2
      const elev = Math.sin(sunAngle) * 18 + 16
      dirLightRef.current.color.copy(sunColors[idx]).lerp(sunColors[nextIdx], smoothBlend)
      dirLightRef.current.intensity = THREE.MathUtils.lerp(sunIntensities[idx], sunIntensities[nextIdx], smoothBlend)
      dirLightRef.current.position.set(ax + Math.cos(sunAngle) * 28, Math.max(7, elev), az + 12)
      const cam = dirLightRef.current.shadow.camera
      cam.left = -shadowSize
      cam.right = shadowSize
      cam.top = shadowSize
      cam.bottom = -shadowSize
      cam.near = 0.5
      cam.far = 110
      cam.updateProjectionMatrix()
    }

    if (targetRef.current) {
      targetRef.current.position.set(ax, 0, az)
      targetRef.current.updateMatrixWorld()
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientIntensities[idx], ambientIntensities[nextIdx], smoothBlend)
    }

    _bg.copy(skyColors[idx]).lerp(skyColors[nextIdx], smoothBlend)
    state.scene.background = _bg
    if (state.scene.fog) state.scene.fog.color.copy(_bg)
  })

  return (
    <>
      <object3D ref={targetRef} />
      <ambientLight ref={ambientRef} intensity={0.7} color="#ffffff" />
      <directionalLight
        ref={dirLightRef}
        position={[14, 22, 10]}
        intensity={1.8}
        color="#fff6e0"
        castShadow={active}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.05}
        shadow-camera-far={110}
        shadow-camera-near={0.5}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
      />
      <hemisphereLight
        color={isWinter ? '#9eb0c0' : '#9fd0dc'}
        groundColor={isWinter ? '#3d4a45' : '#2f6b3a'}
        intensity={0.38}
      />
    </>
  )
}
