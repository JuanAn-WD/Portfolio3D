import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Prop } from './Prop'
import { Chimney } from './SmokeParticle'

const LABEL_STYLE = {
  backgroundColor: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(8px)',
  color: '#60a5fa',
  padding: '8px 16px',
  borderRadius: '12px',
  fontFamily: 'system-ui, sans-serif',
  fontWeight: '800',
  fontSize: '14px',
  whiteSpace: 'nowrap',
  border: '2px solid rgba(96, 165, 250, 0.3)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

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
  const lat = position[2] / 50
  const lon = -position[0] / 50

  useFrame(() => {
    if (!interactRef.current) return
    interactRef.current.getWorldPosition(posRef.current)
    const isClose = posRef.current.length() < interactDistance

    if (isClose && !wasClose.current) {
      setTooltip({ text: interactData.tooltip || interactData.title, action: () => onEnter(interactData) })
      wasClose.current = true
    } else if (!isClose && wasClose.current) {
      setTooltip(null)
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

          <Html position={[0, popupHeight, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={LABEL_STYLE}>
              {popupTitle}
            </div>
          </Html>
        </group>
      </group>
    </group>
  )
})
GlobeBuilding.displayName = 'GlobeBuilding'

export { GlobeBuilding }
