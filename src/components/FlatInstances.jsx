import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { writeFlatToGlobe, writeSurfaceQuat } from '../world/globe'

const _dummy = new THREE.Object3D()

/**
 * Repite un GLB con InstancedMesh. El modelo se apoya en y = 0 y se centra en XZ,
 * así que `position` es el centro de la base aunque el pivote del archivo no lo sea.
 */
export function FlatInstances({ model, items, shadow = false }) {
  const { scene } = useGLTF(model)
  const meshRefs = useRef([])

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())
    const pivot = new THREE.Matrix4().makeTranslation(-center.x, -box.min.y, -center.z)
    const list = []
    scene.traverse((child) => {
      if (!child.isMesh || !child.geometry) return
      list.push({
        geometry: child.geometry,
        material: child.material,
        local: new THREE.Matrix4().multiplyMatrices(pivot, child.matrixWorld),
      })
    })
    return list
  }, [scene])

  useLayoutEffect(() => {
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
        writeFlatToGlobe(x, z, 0.03, globePoint)
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
  }, [items, parts])

  if (!items.length || !parts.length) return null

  return (
    <group>
      {parts.map((part, i) => (
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
