import { useProgress } from '@react-three/drei'

export function LoaderScreen() {
  const { active, progress, loaded, total } = useProgress()
  if (!active && progress >= 100) return null

  const pct = Math.min(100, Math.round(progress || 0))
  return (
    <div className="loader-screen" role="status" aria-live="polite">
      <div className="loader-card">
        <p className="loader-title">Cargando el planeta</p>
        <div className="loader-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="loader-meta">{pct}% {total > 0 ? `· ${loaded}/${total} assets` : ''}</p>
      </div>
    </div>
  )
}
