import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Chimney } from './SmokeParticle'
import { GlobeFrame } from './GlobeFrame'
import { groundSink } from '../world/globe'

const _door = new THREE.Vector3()

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
  return { clone, size, roof: roofHeight(clone, size.y) }
}

/** Altura del tejado, sin contar una chimenea estrecha que suba el bounding box. */
function roofHeight(clone, fallback) {
  clone.updateMatrixWorld(true)
  const v = new THREE.Vector3()
  const pts = []
  clone.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return
    const attr = child.geometry.attributes.position
    for (let i = 0; i < attr.count; i++) {
      v.fromBufferAttribute(attr, i)
      child.localToWorld(v)
      pts.push(v.x, v.y, v.z)
    }
  })
  if (pts.length < 12) return fallback
  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  let maxY = 0
  for (let i = 0; i < pts.length; i += 3) {
    minX = Math.min(minX, pts[i])
    maxX = Math.max(maxX, pts[i])
    maxY = Math.max(maxY, pts[i + 1])
    minZ = Math.min(minZ, pts[i + 2])
    maxZ = Math.max(maxZ, pts[i + 2])
  }
  const foot = (maxX - minX) * (maxZ - minZ) || 1
  const step = Math.max(0.04, maxY / 36)
  let roof = 0
  for (let y = step; y <= maxY + 0.001; y += step) {
    let x0 = Infinity
    let z0 = Infinity
    let x1 = -Infinity
    let z1 = -Infinity
    let n = 0
    for (let i = 0; i < pts.length; i += 3) {
      if (Math.abs(pts[i + 1] - y) > step * 0.65) continue
      n += 1
      x0 = Math.min(x0, pts[i])
      x1 = Math.max(x1, pts[i])
      z0 = Math.min(z0, pts[i + 2])
      z1 = Math.max(z1, pts[i + 2])
    }
    if (n < 8) continue
    if (((x1 - x0) * (z1 - z0)) / foot > 0.28) roof = y
  }
  return roof > 0 ? roof : fallback
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

const SIGN_FONT = '"Liberation Serif", "DejaVu Serif", Georgia, serif'

function signLayout(ctx, label, maxWidth) {
  const words = label.trim().split(/\s+/)
  let size = 128
  while (size >= 52) {
    ctx.font = `700 ${size}px ${SIGN_FONT}`
    if (ctx.measureText(label).width <= maxWidth) return { size, lines: [label] }
    if (words.length > 1) {
      for (let i = 1; i < words.length; i++) {
        const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
        const widest = Math.max(...lines.map((line) => ctx.measureText(line).width))
        if (widest <= maxWidth) return { size, lines }
      }
    }
    size -= 4
  }
  return { size: 52, lines: words }
}

function makeSignTexture(label) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  const { size, lines } = signLayout(ctx, label, 460)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `700 ${size}px ${SIGN_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = Math.max(10, size * 0.09)
  ctx.strokeStyle = 'rgba(255, 246, 226, 0.92)'
  ctx.fillStyle = '#3a2414'
  const lineHeight = size * 1.02
  const top = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2
  for (let i = 0; i < lines.length; i++) {
    const y = top + i * lineHeight
    ctx.strokeText(lines[i], canvas.width / 2, y)
    ctx.fillText(lines[i], canvas.width / 2, y)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function SignFace({ texture, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} renderOrder={2}>
      <planeGeometry args={[0.4, 0.25]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.35} toneMapped={false} />
    </mesh>
  )
}

function Sign({ position, label }) {
  const { scene } = useGLTF('/models/ExtDecoration/sign.glb')
  const clone = useMemo(() => prepareClone(scene).clone, [scene])
  const texture = useMemo(() => (label ? makeSignTexture(label) : null), [label])
  useEffect(() => () => texture?.dispose(), [texture])
  return (
    <group position={position} scale={1.7}>
      <primitive object={clone} />
      {texture && (
        <>
          <SignFace texture={texture} position={[0, 0.42, 0.072]} />
          <SignFace texture={texture} position={[0, 0.42, -0.072]} rotation={[0, Math.PI, 0]} />
        </>
      )}
    </group>
  )
}

/**
 * Edificio sobre el planeta. La elipse de choque la registra `onHitbox`
 * (el personaje y los animales la consultan). La puerta es el eje local +Z.
 */
export function MapBuilding({
  id,
  model,
  position,
  rotation = 0,
  modelYaw = 0,
  scale = 1,
  label,
  tooltip,
  marker = false,
  chimney,
  action,
  onActivate,
  onHitbox,
  enabled = true,
  interactDistance = 2.5,
  /** Desplazamiento local [x, z] del punto de interacción respecto al centro del frente (+Z). */
  doorOffset = [0, 0],
  /** Desplazamiento local [x, z] del cartel. Si no se pasa, queda al lado contrario de la puerta y fuera del muro. */
  signOffset,
}) {
  const { scene } = useGLTF(model)
  const { clone, size, roof: roofY } = useMemo(() => prepareClone(scene), [scene])
  const doorRef = useRef()
  const wasClose = useRef(false)

  const sx = Array.isArray(scale) ? scale[0] : scale
  const sy = Array.isArray(scale) ? scale[1] : scale
  const sz = Array.isArray(scale) ? scale[2] : scale
  const halfX = (size.x * sx) / 2
  const halfY = (size.y * sy) / 2
  const halfZ = (size.z * sz) / 2
  const shrink = 0.86
  const doorX = doorOffset[0] || 0
  const doorLocal = [
    doorX + 0.05,
    Math.min(1.15, halfY * 0.55 + 0.35),
    halfZ * shrink + 0.55 + (doorOffset[1] || 0),
  ]
  // Cartel delante del muro y al otro lado de la puerta, nunca dentro del vano.
  const signLocal = signOffset || [
    doorX >= 0 ? -Math.max(1.05, halfX * 0.42) : Math.max(1.05, halfX * 0.42),
    0,
    halfZ + 1.25,
  ]

  useLayoutEffect(() => {
    if (!onHitbox) return undefined
    return onHitbox({
      id,
      x: position[0],
      z: position[2],
      yaw: rotation,
      halfX: halfX * 0.88,
      halfZ: halfZ * 0.88,
      halfY,
    })
  }, [onHitbox, id, position, rotation, halfX, halfY, halfZ])

  useFrame(() => {
    if (!action || !doorRef.current) return
    if (!enabled) {
      if (wasClose.current) {
        onActivate?.({ id, close: false })
        wasClose.current = false
      }
      return
    }
    doorRef.current.getWorldPosition(_door)
    const close = _door.length() < interactDistance
    if (close && !wasClose.current) {
      onActivate?.({ id, tooltip, close: true })
      wasClose.current = true
    } else if (!close && wasClose.current) {
      onActivate?.({ id, close: false })
      wasClose.current = false
    }
  })

  const roof = size.y * sy
  const chimneyY = roofY * sy - 0.02
  const sink = groundSink(Math.hypot(halfX, halfZ), 0.04)

  return (
    <GlobeFrame x={position[0]} y={-sink} z={position[2]} yaw={rotation}>
      <group>
        <group scale={[sx, sy, sz]} rotation={[0, modelYaw, 0]}>
          <primitive object={clone} />
        </group>

        {chimney && (
          <Chimney
            path={chimney.model}
            position={[chimney.offset[0], chimneyY, chimney.offset[1]]}
            scale={chimney.scale}
            smokeHeight={(chimney.height || 1.6) * chimney.scale}
          />
        )}

        {marker && <Sign label={label} position={signLocal} />}

        <group ref={doorRef} position={doorLocal} />
        {marker && <DoorMarker position={[doorLocal[0], doorLocal[1], doorLocal[2]]} />}

        {label && (
          <Html position={[0, roof + 0.55, 0]} center distanceFactor={12} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
            <div className="building-label">{label}</div>
          </Html>
        )}
      </group>
    </GlobeFrame>
  )
}
