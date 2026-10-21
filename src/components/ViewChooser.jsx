import {
  VIEW_3D,
  VIEW_CLASSIC,
  goToView,
  hasWebGL,
  prefersReducedMotion,
  viewHref,
} from '../helpers/viewMode'

// Pantalla de elección: va antes de descargar nada del 3D. Solo se ve la primera vez
// (después se recuerda la última vista) o al abrir la raíz sin ?modo=.
const preloadPlanet = () => import('../App.jsx')

export function ViewChooser() {
  const webgl = hasWebGL()
  const reduced = prefersReducedMotion()
  const recommendClassic = !webgl || reduced

  const choose = (view) => (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    // replace: la pantalla de elección no queda en el historial (Atrás sale de la web o vuelve a la otra vista).
    goToView(view, { push: false })
  }

  const planet = (
    <li key="3d" className={`view-option${recommendClassic ? '' : ' is-recommended'}`}>
      {webgl ? (
        <a
          href={viewHref(VIEW_3D)}
          className="view-option-link"
          onClick={choose(VIEW_3D)}
          onPointerEnter={preloadPlanet}
        >
          <span className="view-option-title">Explorar el planeta 3D</span>
          <span className="view-option-text">
            Recorre un pequeño pueblo en 3D y acércate a los edificios para ver mis proyectos. Tarda un poco más en cargar.
          </span>
        </a>
      ) : (
        <div className="view-option-link is-disabled" aria-disabled="true">
          <span className="view-option-title">Explorar el planeta 3D</span>
          <span className="view-option-text">Tu navegador no puede mostrar gráficos 3D (WebGL no disponible).</span>
        </div>
      )}
    </li>
  )

  const classic = (
    <li key="clasico" className={`view-option${recommendClassic ? ' is-recommended' : ''}`}>
      <a
        href={viewHref(VIEW_CLASSIC)}
        className="view-option-link"
        onClick={choose(VIEW_CLASSIC)}
      >
        <span className="view-option-title">Ver portfolio clásico</span>
        <span className="view-option-text">
          Una web de siempre, con scroll: experiencia, proyectos, stack y CV. Carga al momento.
        </span>
      </a>
    </li>
  )

  return (
    <main className="view-chooser" aria-labelledby="view-chooser-title">
      <div className="view-chooser-card">
        <p className="brand-intro-role">Frontend Developer · Juan Antonio López</p>
        <h1 id="view-chooser-title" className="view-chooser-name">JuanAn</h1>
        <p className="view-chooser-question">¿Cómo quieres ver mi portfolio?</p>
        {reduced && webgl && (
          <p className="view-chooser-note">Tienes activado «reducir movimiento», así que te recomiendo la versión clásica.</p>
        )}
        <ul className="view-options">{recommendClassic ? [classic, planet] : [planet, classic]}</ul>
        <p className="view-chooser-foot">Puedes cambiar de una a otra cuando quieras.</p>
      </div>
    </main>
  )
}
