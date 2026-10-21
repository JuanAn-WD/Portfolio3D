/**
 * Vistas del portfolio y su URL. Sin dependencias: lo importa la entrada principal,
 * así que aquí no puede entrar nada de three ni de la vista clásica.
 *
 *   /?modo=3d       → planeta 3D
 *   /?modo=clasico  → portfolio clásico
 *   /               → la última vista elegida (localStorage) o la pantalla de elección
 */
export const VIEW_3D = '3d'
export const VIEW_CLASSIC = 'clasico'
export const VIEW_PARAM = 'modo'
export const VIEW_EVENT = 'portfolio:view'

const STORAGE_KEY = 'portfolio-vista'
const VIEWS = [VIEW_3D, VIEW_CLASSIC]

/** Vista pedida en la URL actual, o null si no hay ?modo= válido. */
export function readViewFromUrl() {
  const value = new URLSearchParams(window.location.search).get(VIEW_PARAM)
  return VIEWS.includes(value) ? value : null
}

/** Enlace compartible a una vista (conserva el resto de parámetros, p. ej. ?vista en desarrollo). */
export function viewHref(view) {
  const url = new URL(window.location.href)
  url.searchParams.set(VIEW_PARAM, view)
  url.hash = ''
  return `${url.pathname}${url.search}`
}

export function readRememberedView() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return VIEWS.includes(value) ? value : null
  } catch {
    return null
  }
}

export function rememberView(view) {
  try {
    localStorage.setItem(STORAGE_KEY, view)
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Cambia de vista sin recargar. push=true añade una entrada al historial (el botón
 * Atrás vuelve a la vista anterior); push=false la sustituye.
 */
export function goToView(view, { push = true } = {}) {
  const href = viewHref(view)
  if (push) window.history.pushState({ view }, '', href)
  else window.history.replaceState({ view }, '', href)
  rememberView(view)
  window.dispatchEvent(new CustomEvent(VIEW_EVENT, { detail: view }))
}

/** Para <a href> con navegación interna: deja pasar Ctrl/Cmd/Mayús/clic central (pestaña nueva). */
export function handleViewLinkClick(event, view) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  goToView(view)
}

let webglCache
/** ¿Puede este navegador crear un contexto WebGL? Se comprueba una vez y se libera enseguida. */
export function hasWebGL() {
  if (webglCache !== undefined) return webglCache
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    webglCache = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglCache = false
  }
  return webglCache
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
