import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { profile } from '../config/content'
import { VIEW_CLASSIC, handleViewLinkClick, viewHref } from '../helpers/viewMode'

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
    <div className="loader-screen">
      <div className="loader-card">
        <div role="status" aria-live="polite">
          <p className="loader-brand">{profile.name}</p>
          <p className="loader-title">Cargando el planeta</p>
          <div className="loader-bar" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="loader-meta">{pct}% {total > 0 ? `· ${loaded}/${total} assets` : ''}</p>
        </div>
        <a
          className="loader-alt"
          href={viewHref(VIEW_CLASSIC)}
          onClick={(e) => handleViewLinkClick(e, VIEW_CLASSIC)}
        >
          ¿Sin 3D? Ver portfolio clásico
        </a>
      </div>
    </div>
  )
}
