import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const MovementContext = createContext(null)

export function MovementProvider({ children }) {
  const [axes, setAxes] = useState({ x: 0, z: 0 })
  const setStick = useCallback((x, z) => {
    setAxes((prev) => (prev.x === x && prev.z === z ? prev : { x, z }))
  }, [])
  const value = useMemo(() => ({ axes, setStick }), [axes, setStick])
  return <MovementContext.Provider value={value}>{children}</MovementContext.Provider>
}

export function useMovement() {
  const ctx = useContext(MovementContext)
  if (!ctx) return { axes: { x: 0, z: 0 }, setStick: () => {} }
  return ctx
}
