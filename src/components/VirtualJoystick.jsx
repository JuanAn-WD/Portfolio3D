import { useRef } from 'react'
import { useMovement } from '../context/MovementContext'

const SIZE = 148
const KNOB = 46
const MAX = (SIZE - KNOB) / 2

export function VirtualJoystick() {
  const { setStick } = useMovement()
  const baseRef = useRef(null)
  const knobRef = useRef(null)
  const pointerId = useRef(null)

  const reset = () => {
    pointerId.current = null
    setStick(0, 0)
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(-50%, -50%)'
    }
  }

  const moveTo = (clientX, clientY) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = clientX - cx
    let dy = clientY - cy
    const len = Math.hypot(dx, dy) || 1
    const clamped = Math.min(len, MAX)
    dx = (dx / len) * clamped
    dy = (dy / len) * clamped
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    }
    setStick(dx / MAX, dy / MAX)
  }

  return (
    <div
      className="dpad"
      ref={baseRef}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        pointerId.current = e.pointerId
        moveTo(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => {
        if (pointerId.current !== e.pointerId) return
        moveTo(e.clientX, e.clientY)
      }}
      onPointerUp={reset}
      onPointerCancel={reset}
      aria-hidden="true"
    >
      <div className="dpad-arm dpad-arm-v" />
      <div className="dpad-arm dpad-arm-h" />
      <span className="dpad-dir dpad-dir-up" />
      <span className="dpad-dir dpad-dir-down" />
      <span className="dpad-dir dpad-dir-left" />
      <span className="dpad-dir dpad-dir-right" />
      <div className="dpad-knob" ref={knobRef} />
    </div>
  )
}
