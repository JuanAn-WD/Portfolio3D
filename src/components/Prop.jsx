import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

export function Prop({ path, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => cloneSkeleton(scene), [scene])
  return <primitive object={clone} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
}
