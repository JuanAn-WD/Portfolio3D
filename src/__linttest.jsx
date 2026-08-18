import { useState, useRef } from 'react'

export function T() {
  const [a] = useState(() => Math.random() * 10)
  const r = useRef(null)
  if (r.current === null) {
    r.current = Math.random()
  }
  return <div>{a} {r.current}</div>
}
