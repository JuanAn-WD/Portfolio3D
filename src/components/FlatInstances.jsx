import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { groundSink, writeFlatToGlobe, writeSurfaceQuat } from '../world/globe'

const _dummy = new THREE.Object3D()
const _vert = new THREE.Vector3()

/** Radio horizontal de los vértices que tocan el suelo, tras apoyar el modelo en y = 0. */
function baseFootprint(parts) {
  let lowest = Infinity
  for (const part of parts) {
    const attr = part.geometry.attributes.position
    if (!attr) continue
    for (let i = 0; i < attr.count; i++) {
      _vert.fromBufferAttribute(attr, i).applyMatrix4(part.local)
      if (_vert.y < lowest) lowest = _vert.y
    }
  }
  if (!Number.isFinite(lowest)) return 0.2
  const limit = lowest + 0.1
  let maxR = 0
  for (const part of parts) {
    const attr = part.geometry.attributes.position
    if (!attr) continue
    for (let i = 0; i < attr.count; i++) {
      _vert.fromBufferAttribute(attr, i).applyMatrix4(part.local)
      if (_vert.y > limit) continue
      const r = Math.hypot(_vert.x, _vert.z)
      if (r > maxR) maxR = r
    }
  }
  return Math.max(maxR, 0.04)
}

/**
 * Repite un GLB con InstancedMesh. El modelo se apoya en y = 0 y se centra en XZ,
 * así que `position` es el centro de la base aunque el pivote del archivo no lo sea.
 * Cada copia se hunde lo justo para que el borde de esa base toque la esfera.
 */
export function FlatInstances({ model, items, shadow = false }) {
  const { scene } = useGLTF(model)
  const meshRefs = useRef([])

  const prepared = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const pivot = new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z)
    const parts = []
    scene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return
      parts.push({
        geometry: child.geometry,
        material: child.material,
        local: new THREE.Matrix4().multiplyMatrices(pivot, child.matrixWorld),
      })
    })
    return { parts, baseRadius: baseFootprint(parts) }
  }, [scene])

  useLayoutEffect(() => {
    const { parts, baseRadius } = prepared
    const globePoint = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    parts.forEach((part, pi) => {
      const mesh = meshRefs.current[pi]
      if (!mesh) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const scale = item.scale
        const sx = Array.isArray(scale) ? scale[0] : scale
        const sy = Array.isArray(scale) ? scale[1] : scale
        const sz = Array.isArray(scale) ? scale[2] : scale
        const [x, , z] = item.position
        const foot = baseRadius * Math.max(sx, sz)
        writeFlatToGlobe(x, z, -groundSink(foot, 0.015), globePoint)
        writeSurfaceQuat(x, z, item.rotation || 0, quat)
        _dummy.position.copy(globePoint)
        _dummy.quaternion.copy(quat)
        _dummy.scale.set(sx, sy, sz)
        _dummy.updateMatrix()
        _dummy.matrix.multiply(part.local)
        mesh.setMatrixAt(i, _dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80)
      mesh.frustumCulled = false
    })
  }, [items, prepared])

  if (!items.length || !prepared.parts.length) return null

  return (
    <group>
      {prepared.parts.map((part, i) => (
        <instancedMesh
          key={`${model}-${i}-${items.length}`}
          ref={(el) => { meshRefs.current[i] = el }}
          args={[part.geometry, part.material, items.length]}
          castShadow={shadow}
          receiveShadow={shadow}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
