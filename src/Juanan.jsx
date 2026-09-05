import { useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'

export function Juanan({ animationName = 'idle', ...props }) {
  const { scene, animations } = useGLTF('/models/Player/juanan.glb')
  const clone = useMemo(() => cloneSkeleton(scene), [scene])
  const { actions, names } = useAnimations(animations, clone)

  useEffect(() => {
    if (!actions || names.length === 0) return

    const targetPrefix = animationName.toLowerCase()

    names.forEach((name) => {
      const action = actions[name]
      if (!action) return

      const isTarget = name.toLowerCase().startsWith(targetPrefix)

      if (isTarget) {
        action.timeScale = targetPrefix === 'walk' ? 1.3 : 1.0
        action.reset().fadeIn(0.2).play()
      } else {
        action.fadeOut(0.2)
      }
    })
  }, [animationName, actions, names])

  return <primitive object={clone} {...props} />
}
