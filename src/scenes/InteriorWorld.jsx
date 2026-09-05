import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { dampAngle } from '../helpers/dampAngle'
import { useMovement } from '../context/MovementContext'
import { Juanan } from '../Juanan'
import { Prop } from '../components/Prop'
import { interiorFurniture, projects } from '../config/content'

function InteriorPlayer({ isFrozen }) {
  const rbRef = useRef()
  const visualRef = useRef()
  const [, getKeys] = useKeyboardControls()
  const { axes } = useMovement()
  const [anim, setAnim] = useState('idle')
  const currentRot = useRef(0)
  const cameraTarget = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!rbRef.current || isFrozen) {
      if (anim !== 'idle') setAnim('idle')
      if (rbRef.current) rbRef.current.setLinvel({ x: 0, y: rbRef.current.linvel().y, z: 0 }, true)
      return
    }

    const { forward, backward, left, right } = getKeys()
    const maxSpeed = 3.5
    const linvel = rbRef.current.linvel()
    let tx = axes.x * maxSpeed
    let tz = axes.z * maxSpeed
    if (forward) tz -= maxSpeed
    if (backward) tz += maxSpeed
    if (left) tx -= maxSpeed
    if (right) tx += maxSpeed

    rbRef.current.setLinvel({
      x: THREE.MathUtils.damp(linvel.x, tx, 12, delta),
      y: linvel.y,
      z: THREE.MathUtils.damp(linvel.z, tz, 12, delta),
    }, true)

    if (tx !== 0 || tz !== 0) {
      currentRot.current = dampAngle(currentRot.current, Math.atan2(tx, tz), 14, delta)
      if (anim !== 'walk') setAnim('walk')
    } else if (anim !== 'idle') {
      setAnim('idle')
    }

    if (visualRef.current) visualRef.current.rotation.y = currentRot.current

    const pos = rbRef.current.translation()
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, pos.x, 5, delta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, pos.y + 9, 5, delta)
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, pos.z + 6, 5, delta)
    cameraTarget.current.set(pos.x, pos.y, pos.z)
    state.camera.lookAt(cameraTarget.current)
  })

  return (
    <RigidBody ref={rbRef} type="dynamic" position={[0, 2, 3]} enabledRotations={[false, false, false]} linearDamping={2} colliders={false}>
      <CapsuleCollider args={[0.4, 0.35]} position={[0, 0.75, 0]} />
      <group ref={visualRef}><Juanan animationName={anim} scale={0.8} /></group>
    </RigidBody>
  )
}

function Furnishing({ path, position, rotation, scale, collider }) {
  return (
    <>
      <group position={position} rotation={rotation}>
        <Prop path={path} scale={scale} />
      </group>
      {collider && (
        <RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
          <CuboidCollider args={collider.args} position={collider.offset || [0, 0.8, 0]} />
        </RigidBody>
      )}
    </>
  )
}

export function InteriorWorld({ onExitHouse, onOpenModal, setTooltip, isFrozen }) {
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.9} color="#ffffff" />
      <pointLight position={[-6.0, 3.5, -6.0]} intensity={2.0} color="#60a5fa" distance={12} />
      <pointLight position={[6.0, 3.5, -6.0]} intensity={1.6} color="#fde047" distance={14} />
      <pointLight position={[-6.0, 4.0, 6.0]} intensity={2.0} color="#fef08a" distance={14} castShadow />
      <pointLight position={[6.0, 3.5, 6.0]} intensity={1.5} color="#cbd5e1" distance={10} />

      <Physics debug={false}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[6, 0.2, 6]} position={[0, -0.2, 0]} />
          <mesh position={[0, -0.01, 0]} receiveShadow><boxGeometry args={[12, 0.1, 12]} /><meshStandardMaterial color="#78350f" roughness={0.5} /></mesh>

          <CuboidCollider args={[6, 2, 0.2]} position={[0, 2, -6.2]} />
          <mesh position={[0, 2, -6.2]} receiveShadow><boxGeometry args={[12, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>

          <CuboidCollider args={[0.2, 2, 6]} position={[-6.2, 2, 0]} />
          <mesh position={[-6.2, 2, 0]} receiveShadow><boxGeometry args={[0.4, 4, 12]} /><meshStandardMaterial color="#e2e8f0" /></mesh>

          <CuboidCollider args={[0.2, 2, 6]} position={[6.2, 2, 0]} />
          <mesh position={[6.2, 2, 0]} receiveShadow><boxGeometry args={[0.4, 4, 12]} /><meshStandardMaterial color="#e2e8f0" /></mesh>

          <CuboidCollider args={[2.5, 2, 0.2]} position={[-3.5, 2, 6.2]} />
          <CuboidCollider args={[2.5, 2, 0.2]} position={[3.5, 2, 6.2]} />
          <mesh position={[-3.5, 2, 6.2]}><boxGeometry args={[5, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[3.5, 2, 6.2]}><boxGeometry args={[5, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>

          <CuboidCollider args={[1.5, 3, 0.2]} position={[0, 3, 6.6]} />
        </RigidBody>

        {interiorFurniture.map((item, i) => (
          <Furnishing key={`${item.path}-${i}`} {...item} />
        ))}

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[2.0, 1.5, 2.0]}
            position={[-3.5, 1.5, -2.5]}
            sensor
            onIntersectionEnter={() => setTooltip({ text: 'examinar el setup', action: () => onOpenModal(projects.setup) })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[1.5, 1.5, 1.0]}
            position={[0, 1.5, 5.0]}
            sensor
            onIntersectionEnter={() => setTooltip({ text: 'salir del estudio', action: onExitHouse })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>
        <mesh position={[0, 2.6, 5.8]}><boxGeometry args={[2.0, 0.6, 0.05]} /><meshStandardMaterial color="#dc2626" /></mesh>

        <InteriorPlayer isFrozen={isFrozen} />
      </Physics>
    </>
  )
}
