import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { Chimney } from './SmokeParticle'

const _door = new THREE.Vector3()
const _player = new THREE.Vector3()

function prepareClone(scene) {
  const clone = scene.clone(true)
  clone.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(clone)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  clone.position.set(-center.x, -box.min.y, -center.z)
  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return { clone, size }
}

function DoorMarker({ position }) {
  const bob = useRef()
  useFrame((state) => {
    if (!bob.current) return
    bob.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.2) * 0.08
  })
  return (
    <mesh ref={bob} position={position}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial color="#5eb8a8" emissive="#5eb8a8" emissiveIntensity={0.55} toneMapped={false} />
    </mesh>
  )
}

function Sign({ position }) {
  const { scene } = useGLTF('/models/ExtDecoration/sign.glb')
  const clone = useMemo(() => prepareClone(scene).clone, [scene])
  return (
    <group position={position} scale={1.7}>
      <primitive object={clone} />
    </group>
  )
}

/**
 * Edificio apoyado en el suelo, con caja de colisión y, si tiene acción,
 * un punto de interacción delante de la cara +Z.
 */
export function MapBuilding({
  id,
  model,
  position,
  rotation = 0,
  scale = 1,
  label,
  tooltip,
  marker = false,
  chimney,
  action,
  onActivate,
  playerRef,
  enabled = true,
  interactDistance = 2.15,
}) {
  const { scene } = useGLTF(model)
  const { clone, size } = useMemo(() => prepareClone(scene), [scene])
  const doorRef = useRef()
  const wasClose = useRef(false)

  const sx = Array.isArray(scale) ? scale[0] : scale
  const sy = Array.isArray(scale) ? scale[1] : scale
  const sz = Array.isArray(scale) ? scale[2] : scale
  const halfX = (size.x * sx) / 2
  const halfY = (size.y * sy) / 2
  const halfZ = (size.z * sz) / 2
  const shrink = 0.86
  const doorLocal = [0.15, 1.15, halfZ * shrink + 0.7]

  useFrame(() => {
    if (!action || !doorRef.current || !playerRef?.current) return
    if (!enabled) {
      if (wasClose.current) {
        onActivate?.({ id, close: false })
        wasClose.current = false
      }
      return
    }
    doorRef.current.getWorldPosition(_door)
    _player.copy(playerRef.current)
    const dx = _player.x - _door.x
    const dz = _player.z - _door.z
    const close = dx * dx + dz * dz < interactDistance * interactDistance
    if (close && !wasClose.current) {
      onActivate?.({ id, tooltip, close: true })
      wasClose.current = true
    } else if (!close && wasClose.current) {
      onActivate?.({ id, close: false })
      wasClose.current = false
    }
  })

  const roof = size.y * sy

  return (
    <>
      <group position={position} rotation={[0, rotation, 0]}>
        <group scale={[sx, sy, sz]} position={[0, 0.02, 0]}>
          <primitive object={clone} />
        </group>

        {chimney && (
          <Chimney
            path={chimney.model}
            position={[chimney.offset[0], roof - 0.04, chimney.offset[1]]}
            scale={chimney.scale}
            smokeHeight={(chimney.height || 1.6) * chimney.scale}
          />
        )}

        {marker && <Sign position={[halfX * 0.35 + 0.7, 0.02, halfZ * shrink + 0.05]} />}

        <group ref={doorRef} position={doorLocal} />
        {marker && <DoorMarker position={[doorLocal[0], doorLocal[1], doorLocal[2]]} />}

        {label && (
          <Html position={[0, roof + 0.55, 0]} center distanceFactor={12} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div className="building-label">{label}</div>
          </Html>
        )}
      </group>

      <RigidBody type="fixed" colliders={false} position={position} rotation={[0, rotation, 0]}>
        <CuboidCollider args={[halfX * shrink, halfY, halfZ * shrink]} position={[0, halfY + 0.02, 0]} />
      </RigidBody>
    </>
  )
}
