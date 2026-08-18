import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { dampAngle } from '../helpers/dampAngle'
import { Juanan } from '../Juanan'
import { Prop } from '../components/Prop'

// -------------------------------------------------------------
// Controls the player inside the interior scene:
// WASD movement, rotation and idle/walk animation
// -------------------------------------------------------------
function InteriorPlayer({ isFrozen }) {
  const rbRef = useRef()
  const visualRef = useRef()
  const [, getKeys] = useKeyboardControls()
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
    let tx = 0, tz = 0
    if (forward) tz -= maxSpeed; if (backward) tz += maxSpeed; if (left) tx -= maxSpeed; if (right) tx += maxSpeed

    rbRef.current.setLinvel({ x: THREE.MathUtils.damp(linvel.x, tx, 12, delta), y: linvel.y, z: THREE.MathUtils.damp(linvel.z, tz, 12, delta) }, true)

    if (tx !== 0 || tz !== 0) {
      currentRot.current = dampAngle(currentRot.current, Math.atan2(tx, tz), 14, delta)
      if (anim !== 'walk') setAnim('walk')
    } else {
      if (anim !== 'idle') setAnim('idle')
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

// -------------------------------------------------------------
// Interior house scene: room geometry, furniture props,
// colliders and interaction sensors
// -------------------------------------------------------------
export function InteriorWorld({ onExitHouse, onOpenModal, setTooltip, isFrozen }) {
  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.9} color="#ffffff" />
      <pointLight position={[-3.5, 1.2, -4.2]} intensity={1.0} color="#60a5fa" distance={4} />
      <pointLight position={[4.6, 1.0, -4.5]} intensity={1.5} color="#fde047" distance={6} castShadow />
      <pointLight position={[-4.5, 2.5, 2.0]} intensity={1.5} color="#fef08a" distance={8} castShadow />

      <Physics debug={false}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[5, 0.2, 5]} position={[0, -0.2, 0]} />
          <mesh position={[0, -0.01, 0]} receiveShadow><boxGeometry args={[10, 0.1, 10]} /><meshStandardMaterial color="#78350f" roughness={0.5} /></mesh>

          <CuboidCollider args={[5, 2, 0.2]} position={[0, 2, -5.2]} />
          <mesh position={[0, 2, -5.2]} receiveShadow><boxGeometry args={[10, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>

          <CuboidCollider args={[0.2, 2, 5]} position={[-5.2, 2, 0]} />
          <mesh position={[-5.2, 2, 0]} receiveShadow><boxGeometry args={[0.4, 4, 10]} /><meshStandardMaterial color="#e2e8f0" /></mesh>

          <CuboidCollider args={[0.2, 2, 5]} position={[5.2, 2, 0]} />
          <mesh position={[5.2, 2, 0]} receiveShadow><boxGeometry args={[0.4, 4, 10]} /><meshStandardMaterial color="#e2e8f0" /></mesh>

          <CuboidCollider args={[2.0, 2, 0.2]} position={[-3.2, 2, 5.2]} />
          <CuboidCollider args={[2.0, 2, 0.2]} position={[3.2, 2, 5.2]} />
          <mesh position={[-3.2, 2, 5.2]}><boxGeometry args={[4, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>
          <mesh position={[3.2, 2, 5.2]}><boxGeometry args={[4, 4, 0.4]} /><meshStandardMaterial color="#f8fafc" /></mesh>

          <CuboidCollider args={[1.5, 3, 0.2]} position={[0, 3, 5.6]} />
        </RigidBody>

        <Prop path="/models/InteriorHouse/rugRectangle.glb" position={[-3.5, 0.02, -3.6]} rotation={[0, Math.PI / 2, 0]} scale={1.6} />
        <Prop path="/models/InteriorHouse/rugRound.glb" position={[2.8, 0.02, 2.0]} scale={1.8} />

        <Prop path="/models/InteriorHouse/desk.glb" position={[-3.5, 0, -4.2]} rotation={[0, 0, 0]} scale={1.3} />
        <Prop path="/models/InteriorHouse/computerScreen.glb" position={[-3.5, 0.74, -4.5]} rotation={[0, 0, 0]} scale={1.3} />
        <Prop path="/models/InteriorHouse/computerKeyboard.glb" position={[-3.5, 0.74, -4.0]} rotation={[0, 0, 0]} scale={1.3} />
        <Prop path="/models/InteriorHouse/chairDesk.glb" position={[-3.5, 0, -3.0]} rotation={[0, Math.PI, 0]} scale={1.3} />
        <Prop path="/models/InteriorHouse/bookcaseOpen.glb" position={[-4.8, 0, -4.2]} rotation={[0, Math.PI / 2, 0]} scale={1.4} />

        <Prop path="/models/InteriorHouse/bedDouble.glb" position={[3.2, 0, -4.0]} rotation={[0, 0, 0]} scale={1.4} />
        <Prop path="/models/InteriorHouse/sideTable.glb" position={[4.6, 0, -4.4]} rotation={[0, 0, 0]} scale={1.3} />
        <Prop path="/models/InteriorHouse/lampRoundTable.glb" position={[4.6, 0.52, -4.4]} rotation={[0, 0, 0]} scale={1.3} />

        <Prop path="/models/InteriorHouse/loungeSofa.glb" position={[1.2, 0, 2.0]} rotation={[0, Math.PI / 2, 0]} scale={1.4} />
        <Prop path="/models/InteriorHouse/tableCoffee.glb" position={[2.8, 0, 2.0]} rotation={[0, 0, 0]} scale={1.4} />
        <Prop path="/models/InteriorHouse/cabinetTelevision.glb" position={[4.6, 0, 2.0]} rotation={[0, -Math.PI / 2, 0]} scale={1.4} />
        <Prop path="/models/InteriorHouse/televisionModern.glb" position={[4.6, 0.5, 2.0]} rotation={[0, -Math.PI / 2, 0]} scale={1.4} />

        <Prop path="/models/InteriorHouse/pottedPlant.glb" position={[-4.5, 0, 4.5]} scale={1.6} />
        <Prop path="/models/InteriorHouse/lampRoundFloor.glb" position={[-4.5, 0, 2.5]} scale={1.4} />

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.8, 0.4, 0.4]} position={[-3.5, 0.4, -4.2]} />
          <CuboidCollider args={[0.3, 1.0, 0.4]} position={[-4.8, 1.0, -4.5]} />
          <CuboidCollider args={[1.0, 0.3, 1.2]} position={[3.5, 0.3, -4.0]} />
          <CuboidCollider args={[0.5, 0.4, 1.0]} position={[1.5, 0.4, 2.0]} />
          <CuboidCollider args={[0.4, 0.3, 1.0]} position={[4.5, 0.3, 2.0]} />
          <CuboidCollider args={[0.5, 0.2, 0.5]} position={[3.0, 0.2, 2.0]} />
        </RigidBody>

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.5, 1, 1.2]} position={[-3.5, 1, -3.0]} sensor
            onIntersectionEnter={() => setTooltip({ text: "Examinar Setup", action: () => onOpenModal({ title: "Mi Setup de Desarrollo", description: "Trabajando con las últimas tecnologías web.", tags: ["React", "Three.js"] }) })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>

        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.2, 1.5, 0.8]} position={[0, 1, 4.4]} sensor
            onIntersectionEnter={() => setTooltip({ text: "Salir de la Casa", action: onExitHouse })}
            onIntersectionExit={() => setTooltip(null)}
          />
        </RigidBody>
        <mesh position={[0, 2.6, 5.0]}><boxGeometry args={[1.5, 0.4, 0.05]} /><meshStandardMaterial color="#dc2626" /></mesh>

        <InteriorPlayer isFrozen={isFrozen} />
      </Physics>
    </>
  )
}
