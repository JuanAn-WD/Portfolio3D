import { lazy, Suspense, useEffect, useState } from 'react'
import {
  VIEW_3D,
  VIEW_CLASSIC,
  VIEW_EVENT,
  hasWebGL,
  readRememberedView,
  readViewFromUrl,
  rememberView,
  viewHref,
} from './helpers/viewMode'
import { ViewChooser } from './components/ViewChooser'

// Cada vista es un chunk aparte: la clásica no descarga three, r3f, rapier ni los GLB,
// y el 3D no descarga Tailwind ni las fuentes de la clásica.
const PlanetApp = lazy(() => import('./App.jsx'))
const ClassicApp = lazy(() => import('./classic/ClassicApp.jsx'))

// Título y descripción del 3D: los de index.html. Los de la clásica viven en su content.js.
const PLANET_META = {
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
}

const DEV_3D_PARAMS = ['vista', 'pies', 'zoom']

function resolveView(view) {
  // Sin WebGL el planeta no puede arrancar: se cae a la clásica.
  if (view === VIEW_3D && !hasWebGL()) return VIEW_CLASSIC
  return view
}

function initialView() {
  const fromUrl = readViewFromUrl()
  if (fromUrl) return resolveView(fromUrl)
  // Las vistas de depuración (?vista, ?pies, ?zoom) van directas al planeta en desarrollo.
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search)
    if (DEV_3D_PARAMS.some((p) => params.has(p))) return VIEW_3D
  }
  const remembered = readRememberedView()
  return remembered ? resolveView(remembered) : null
}

function PlanetFallback() {
  // Igual que el arranque de LoaderScreen, para que no haya parpadeo mientras baja el chunk.
  return (
    <div className="app-root">
      <div className="loader-screen">
        <div className="loader-card" role="status" aria-live="polite">
          <p className="loader-brand">JuanAn</p>
          <p className="loader-title">Cargando el planeta</p>
          <div className="loader-bar" aria-hidden="true">
            <span style={{ width: '0%' }} />
          </div>
          <p className="loader-meta">0%</p>
        </div>
      </div>
    </div>
  )
}

function ClassicFallback() {
  let light = false
  try {
    light = localStorage.getItem('theme') === 'light'
  } catch {
    /* sin almacenamiento */
  }
  return <div className="classic-fallback" style={{ background: light ? '#f6f8f6' : '#0f1412' }} />
}

export default function Root() {
  const [view, setView] = useState(initialView)

  // La URL siempre refleja la vista que se ve (enlace compartible) y se recuerda la elección.
  useEffect(() => {
    if (!view) return
    rememberView(view)
    if (readViewFromUrl() !== view) {
      window.history.replaceState({ view }, '', viewHref(view) + window.location.hash)
    }
  }, [view])

  useEffect(() => {
    const onPop = () => setView(resolveView(readViewFromUrl()))
    const onChange = (e) => setView(resolveView(e.detail))
    window.addEventListener('popstate', onPop)
    window.addEventListener(VIEW_EVENT, onChange)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener(VIEW_EVENT, onChange)
    }
  }, [])

  // El 3D tiene su título y descripción; la clásica pone los suyos al montarse.
  useEffect(() => {
    if (view === VIEW_CLASSIC) return
    document.title = PLANET_META.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', PLANET_META.description)
  }, [view])

  if (!view) return <ViewChooser />

  return (
    <Suspense fallback={view === VIEW_3D ? <PlanetFallback /> : <ClassicFallback />}>
      {view === VIEW_3D ? <PlanetApp /> : <ClassicApp />}
    </Suspense>
  )
}
