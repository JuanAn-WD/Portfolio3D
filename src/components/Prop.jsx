import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

/**
 * Loads and clones a GLTF model so the same asset can be
 * reused multiple times in the scene without conflicts.
 */
export function Prop({ path, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => scene.clone(), [scene])
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
}
