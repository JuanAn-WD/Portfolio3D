import { useLayoutEffect, useRef } from 'react'
import { Quaternion, Vector3 } from 'three'
import { writeFlatToGlobe, writeSurfaceQuat } from '../world/globe'

const _p = new Vector3()
const _q = new Quaternion()

/** Coloca hijos sobre la esfera usando coordenadas de mapa (x este, z sur). */
export function GlobeFrame({ x = 0, y = 0, z = 0, yaw = 0, children }) {
  const ref = useRef()

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    writeFlatToGlobe(x, z, y, _p)
    writeSurfaceQuat(x, z, yaw, _q)
    node.position.copy(_p)
    node.quaternion.copy(_q)
  }, [x, y, z, yaw])

  return <group ref={ref}>{children}</group>
}
