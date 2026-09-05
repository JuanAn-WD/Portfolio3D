import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { dampAngle } from '../helpers/dampAngle'
import { Prop } from './Prop'

export function GlobePet({
  modelPath,
  position = [0, 0, 0],
  scale = 0.35,
  speed = 0.4,
  flyHeight = 0,
  frozen = false,
}) {
  const pivotRef = useRef()
  const meshRef = useRef()
  const initialLat = position[2] / 50
  const initialLon = -position[0] / 50
  const targetLatLon = useRef([initialLat, initialLon])
  const waitTimer = useRef(0)
  const animalRot = useRef(0)

  useFrame((state, delta) => {
    if (!pivotRef.current || !meshRef.current || frozen) return
    waitTimer.current -= delta

    if (waitTimer.current <= 0) {
      targetLatLon.current = [initialLat + (Math.random() - 0.5) * 0.2, initialLon + (Math.random() - 0.5) * 0.2]
      waitTimer.current = 3 + Math.random() * 4
    }

    const currentLat = pivotRef.current.rotation.x
    const currentLon = pivotRef.current.rotation.z
    pivotRef.current.rotation.x = THREE.MathUtils.damp(currentLat, targetLatLon.current[0], speed, delta)
    pivotRef.current.rotation.z = THREE.MathUtils.damp(currentLon, targetLatLon.current[1], speed, delta)

    const dLat = targetLatLon.current[0] - currentLat
    const dLon = targetLatLon.current[1] - currentLon
    if (Math.abs(dLat) > 0.0001 || Math.abs(dLon) > 0.0001) {
      animalRot.current = dampAngle(animalRot.current, Math.atan2(-dLon, dLat), 8, delta)
    }
    meshRef.current.rotation.y = animalRot.current

    if (flyHeight > 0) meshRef.current.position.y = 50 + position[1] + flyHeight + Math.sin(state.clock.elapsedTime * 4) * 0.2
    else meshRef.current.position.y = 50 + position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.12
  })

  return (
    <group ref={pivotRef} rotation={[initialLat, 0, initialLon]}>
      <group ref={meshRef} position={[0, 50 + position[1] + flyHeight, 0]}>
        <Prop path={modelPath} scale={scale} />
      </group>
    </group>
  )
}
