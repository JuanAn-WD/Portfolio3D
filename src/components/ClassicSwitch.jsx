import { VIEW_CLASSIC, handleViewLinkClick, viewHref } from '../helpers/viewMode'

/**
 * Enlace fijo arriba a la derecha para pasar a la versión clásica. El HUD va arriba a la
 * izquierda y la cruceta y el tooltip abajo, así que no tapa ningún control.
 * Al cambiar de vista se desmonta el <Canvas>, y r3f libera el renderer y el contexto WebGL.
 */
export function ClassicSwitch() {
  return (
    <a
      className="view-switch"
      href={viewHref(VIEW_CLASSIC)}
      onClick={(e) => {
        e.stopPropagation()
        handleViewLinkClick(e, VIEW_CLASSIC)
      }}
      title="Ver el portfolio clásico, sin 3D"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          d="M4 5h16M4 10h16M4 15h10M4 20h7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      Versión clásica
    </a>
  )
}
