import { useLayoutEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { decoPath } from '../config/forest'

const _euler = new THREE.Euler()
const _quat = new THREE.Quaternion()
const _yRot = new THREE.Quaternion()
const _pos = new THREE.Vector3()
const _dummy = new THREE.Object3D()
const _axisY = new THREE.Vector3(0, 1, 0)

const CAST_SHADOW_TYPES = new Set(['tree', 'pine', 'pine-small', 'rock', 'plant', 'stones'])

function InstancedGltf({ path, items, castShadow }) {
  const { scene } = useGLTF(path)
  const meshRefs = useRef([])

  const parts = useMemo(() => {
    scene.updateMatrixWorld(true)
    const list = []
    scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        list.push({
          geometry: child.geometry,
          material: child.material,
          local: child.matrixWorld.clone(),
        })
      }
    })
    return list
  }, [scene])

  useLayoutEffect(() => {
    parts.forEach((part, pi) => {
      const mesh = meshRefs.current[pi]
      if (!mesh) return
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        _euler.set(item.lat, 0, item.lon, 'XYZ')
        _quat.setFromEuler(_euler)
        _yRot.setFromAxisAngle(_axisY, item.rotY)
        _pos.set(0, 50, 0).applyQuaternion(_quat)
        _dummy.position.copy(_pos)
        _dummy.quaternion.copy(_quat).multiply(_yRot)
        _dummy.scale.setScalar(item.scale)
        _dummy.updateMatrix()
        _dummy.matrix.multiply(part.local)
        mesh.setMatrixAt(i, _dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    })
  }, [items, parts])

  return (
    <>
      {parts.map((part, i) => (
        <instancedMesh
          key={`${path}-${i}`}
          ref={(el) => { meshRefs.current[i] = el }}
          args={[part.geometry, part.material, items.length]}
          castShadow={castShadow}
          receiveShadow
          frustumCulled={false}
        />
      ))}
    </>
  )
}

export function ProceduralForest({ decorations, isWinter }) {
  const groups = useMemo(() => {
    const map = new Map()
    for (const deco of decorations) {
      const path = decoPath(deco.type, isWinter)
      if (!path) continue
      if (!map.has(path)) map.set(path, [])
      map.get(path).push(deco)
    }
    return Array.from(map.entries())
  }, [decorations, isWinter])

  return (
    <>
      {groups.map(([path, items]) => (
        <InstancedGltf
          key={path}
          path={path}
          items={items}
          castShadow={items.some((d) => CAST_SHADOW_TYPES.has(d.type))}
        />
      ))}
    </>
  )
}
