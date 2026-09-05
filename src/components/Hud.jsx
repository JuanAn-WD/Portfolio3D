import { profile } from '../config/content'
import { useTouchUi } from '../helpers/useTouchUi'

export function Hud({ onDismiss, visible }) {
  const touch = useTouchUi()

  if (!visible) return null

  return (
    <aside className="hud" aria-label="Controles">
      <div className="hud-brand">
        <strong>{profile.name}</strong>
        <span>{profile.role}</span>
      </div>
      <p className="hud-summary">{profile.summary}</p>
      <ul className="hud-keys">
        {touch ? (
          <>
            <li>Cruzeta inferior izquierda para mover</li>
            <li>Acércate a un edificio y pulsa Interactuar</li>
          </>
        ) : (
          <>
            <li><kbd>WASD</kbd> / flechas — mover</li>
            <li><kbd>E</kbd> — interactuar</li>
            <li><kbd>Esc</kbd> — cerrar ficha</li>
          </>
        )}
      </ul>
      <button type="button" className="hud-hide" onClick={onDismiss}>Ocultar</button>
    </aside>
  )
}
