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
    <RigidBody ref={rbRef} type="dynamic" position={[0, 1.4, 3.4]} enabledRotations={[false, false, false]} linearDamping={2} colliders={false}>
      <CapsuleCollider args={[0.4, 0.35]} position={[0, 0.75, 0]} />
      <group ref={visualRef}><Juanan animationName={anim} scale={0.8} /></group>
    </RigidBody>
  )
}

function Furnishing({ path, position, rotation, scale, collider }) {
  return (
    <>
      <Prop path={path} position={position} rotation={rotation} scale={scale} centerOnGround />
      {collider && (
        <RigidBody type="fixed" colliders={false} position={position} rotation={rotation}>
          <CuboidCollider args={collider.args} position={collider.offset || [0, 0.8, 0]} />
        </RigidBody>
      )}
    </>
  )
}

function RoomShell() {
  const wall = '#f3e7d3'
  const wallCool = '#ebe4d6'
  const wood = '#7a4a24'
  const woodDark = '#5c3518'

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[6, 0.2, 6]} position={[0, -0.2, 0]} />
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[12, 0.08, 12]} />
        <meshStandardMaterial color={wood} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11.4, 11.4]} />
        <meshStandardMaterial color={woodDark} roughness={0.85} />
      </mesh>

      <CuboidCollider args={[6, 2, 0.2]} position={[0, 2, -6.2]} />
      <mesh position={[0, 2, -6.2]} receiveShadow>
        <boxGeometry args={[12, 4, 0.4]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>

      <CuboidCollider args={[0.2, 2, 6]} position={[-6.2, 2, 0]} />
      <mesh position={[-6.2, 2, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4, 12]} />
        <meshStandardMaterial color={wallCool} roughness={0.9} />
      </mesh>

      <CuboidCollider args={[0.2, 2, 6]} position={[6.2, 2, 0]} />
      <mesh position={[6.2, 2, 0]} receiveShadow>
        <boxGeometry args={[0.4, 4, 12]} />
        <meshStandardMaterial color={wallCool} roughness={0.9} />
      </mesh>

      <CuboidCollider args={[2.5, 2, 0.2]} position={[-3.5, 2, 6.2]} />
      <CuboidCollider args={[2.5, 2, 0.2]} position={[3.5, 2, 6.2]} />
      <mesh position={[-3.5, 2, 6.2]}>
        <boxGeometry args={[5, 4, 0.4]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[3.5, 2, 6.2]}>
        <boxGeometry args={[5, 4, 0.4]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>

      <CuboidCollider args={[1.5, 0.55, 0.2]} position={[0, 3.45, 6.2]} />
      <mesh position={[0, 3.45, 6.2]}>
        <boxGeometry args={[2.1, 1.1, 0.38]} />
        <meshStandardMaterial color={wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.55, 6.05]}>
        <boxGeometry args={[2.05, 0.18, 0.12]} />
        <meshStandardMaterial color="#8f2a22" roughness={0.45} />
      </mesh>
    </RigidBody>
  )
}

function WindowPane({ position, rotation = [0, 0, 0], size = [2.2, 1.5] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[size[0] + 0.18, size[1] + 0.18]} />
        <meshStandardMaterial color="#c4b39a" roughness={0.75} />
      </mesh>
      <mesh>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#38bdf8"
          emissiveIntensity={0.4}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

export function InteriorWorld({ onExitHouse, onOpenModal, setTooltip, isFrozen }) {
  return (
    <>
      <color attach="background" args={['#1c1916']} />
      <hemisphereLight args={['#fff7ed', '#7c5a3a', 0.45]} />
      <ambientLight intensity={0.55} color="#fff4e6" />
      <pointLight position={[0, 3.6, 0]} intensity={2.8} color="#ffe8c2" distance={16} castShadow />
      <pointLight position={[-5.2, 2.4, -3.4]} intensity={2.2} color="#93c5fd" distance={8} />
      <pointLight position={[3.15, 2.1, -5.2]} intensity={1.6} color="#fde68a" distance={7} />
      <pointLight position={[3.4, 2.2, 3.2]} intensity={1.8} color="#fed7aa" distance={9} />

      <WindowPane position={[0.2, 2.25, -5.98]} rotation={[0, Math.PI, 0]} />
      <WindowPane position={[5.99, 2.25, -2.8]} rotation={[0, Math.PI / 2, 0]} size={[1.8, 1.4]} />

      <Physics debug={false}>
        <RoomShell />

        {interiorFurniture.map((item, i) => (
          <Furnishing key={`${item.path}-${i}`} {...item} />
        ))}

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[1.7, 1.2, 1.5]}
            position={[-4.7, 1.2, -3.35]}
            sensor
            onIntersectionEnter={() => setTooltip({ text: 'examinar el setup', action: () => onOpenModal(projects.setup) })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[1.1, 1.5, 0.7]}
            position={[0, 1.3, 5.35]}
            sensor
            onIntersectionEnter={() => setTooltip({ text: 'salir del estudio', action: onExitHouse })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>

        <InteriorPlayer isFrozen={isFrozen} />
      </Physics>
    </>
  )
}
