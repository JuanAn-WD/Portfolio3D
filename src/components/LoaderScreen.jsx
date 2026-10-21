import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { profile } from '../config/content'

export function LoaderScreen({ onComplete }) {
  const { active, progress, loaded, total } = useProgress()
  const done = !active && progress >= 100
  const reported = useRef(false)

  useEffect(() => {
    if (!done || reported.current) return
    reported.current = true
    onComplete?.()
  }, [done, onComplete])

  if (done) return null
  if (!active && total === 0) return null

  const pct = Math.min(100, Math.round(progress || 0))
  return (
    <div className="loader-screen" role="status" aria-live="polite">
      <div className="loader-card">
        <p className="loader-brand">{profile.name}</p>
        <p className="loader-title">Cargando el planeta</p>
        <div className="loader-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="loader-meta">{pct}% {total > 0 ? `· ${loaded}/${total} assets` : ''}</p>
      </div>
    </div>
  )
}
