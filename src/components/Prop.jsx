import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

export function Prop({
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  centerOnGround = false,
}) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => {
    const c = cloneSkeleton(scene)
    if (centerOnGround) {
      const box = new THREE.Box3().setFromObject(c)
      const center = box.getCenter(new THREE.Vector3())
      c.position.set(-center.x, -box.min.y, -center.z)
    }
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return c
  }, [scene, centerOnGround])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={clone} castShadow receiveShadow />
    </group>
  )
}
