import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Prop } from './Prop'
import { Chimney } from './SmokeParticle'

/**
 * A project building placed on the globe surface, with a proximity sensor
 * and floating label. Accepts an optional `chimney` prop to attach a
 * smoking chimney on top of the model.
 */
const GlobeBuilding = React.forwardRef(({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  interactData,
  setTooltip,
  onEnter,
  popupTitle,
  popupHeight = 4.0,
  chimney,
  interactPosition = [0, 0, 0],
  interactDistance = 2.5
}, ref) => {
  const interactRef = useRef()
  const wasClose = useRef(false)
  const posRef = useRef(new THREE.Vector3())
  const [near, setNear] = useState(false)
  const lat = position[2] / 50
  const lon = -position[0] / 50

  useFrame(() => {
    if (!interactRef.current) return
    interactRef.current.getWorldPosition(posRef.current)
    const isClose = posRef.current.length() < interactDistance

    if (isClose && !wasClose.current) {
      setTooltip({ text: interactData.tooltip || interactData.title, action: () => onEnter(interactData) })
      setNear(true)
      wasClose.current = true
    } else if (!isClose && wasClose.current) {
      setTooltip(null)
      setNear(false)
      wasClose.current = false
    }
  })

  return (
    <group rotation={[lat, 0, lon]}>
      <group position={[0, 50 + position[1], 0]}>
        <group rotation={rotation} ref={ref}>
          <Prop path={modelPath} scale={scale} />
          {chimney && (
            <Chimney path={chimney.path} position={chimney.position} scale={chimney.scale} />
          )}
          <group ref={interactRef} position={interactPosition} />

          {near && (
            <Html position={[0, popupHeight, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="building-label">{popupTitle}</div>
            </Html>
          )}
        </group>
      </group>
    </group>
  )
})
GlobeBuilding.displayName = 'GlobeBuilding'

export { GlobeBuilding }
