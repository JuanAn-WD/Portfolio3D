import { useTouchUi } from '../helpers/useTouchUi'

export function Hud({ onDismiss, visible }) {
  const touch = useTouchUi()

  if (!visible) return null

  return (
    <aside className="hud" aria-label="Controles">
      <p className="hud-heading">Controles</p>
      <ul className="hud-keys">
        {touch ? (
          <>
            <li>Cruzeta inferior izquierda para mover</li>
            <li>Acércate a un edificio y toca Interactuar</li>
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
