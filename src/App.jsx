import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, KeyboardControls, useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

import { keyboardMap } from './config/keyboardMap'
import { preloadUsedModels } from './config/assets'
import { profile } from './config/content'
import { PlanetWorld } from './scenes/PlanetWorld'
import { MovementProvider } from './context/MovementContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoaderScreen } from './components/LoaderScreen'
import { Hud } from './components/Hud'
import { VirtualJoystick } from './components/VirtualJoystick'
import { usePrefersReducedMotion } from './helpers/usePrefersReducedMotion'
import { useTouchUi } from './helpers/useTouchUi'

preloadUsedModels()

const InteriorWorld = lazy(() =>
  import('./scenes/InteriorWorld').then((m) => ({ default: m.InteriorWorld }))
)

function InteractionBinder({ tooltip, blocked }) {
  const interact = useKeyboardControls((state) => state.interact)
  const wasDown = useRef(false)

  useEffect(() => {
    if (interact && !wasDown.current && tooltip && !blocked) tooltip.action()
    wasDown.current = !!interact
  }, [interact, tooltip, blocked])

  return null
}

export default function App() {
  const [sceneMode, setSceneMode] = useState('island')
  const [isFading, setIsFading] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [hudOpen, setHudOpen] = useState(() => sessionStorage.getItem('hud-hidden') !== '1')
  const isCoarse = useTouchUi()
  const globeQuatRef = useRef(new THREE.Quaternion())
  const closeBtnRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  const switchScene = useCallback((nextScene) => {
    setIsFading(true)
    setTooltip(null)
    const out = reducedMotion ? 0 : 400
    const inn = reducedMotion ? 0 : 200
    setTimeout(() => {
      setSceneMode(nextScene)
      setTimeout(() => setIsFading(false), inn)
    }, out)
  }, [reducedMotion])

  const closeModal = useCallback(() => {
    setModalData(null)
    window.focus()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && modalData) closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalData, closeModal])

  useEffect(() => {
    if (modalData) closeBtnRef.current?.focus()
  }, [modalData])

  const hideHud = () => {
    sessionStorage.setItem('hud-hidden', '1')
    setHudOpen(false)
  }

  const frozen = isFading || !!modalData

  return (
    <div className="app-root" onClick={() => window.focus()}>
      <a className="skip-link" href={profile.github}>Perfil de GitHub</a>

      <ErrorBoundary>
        <MovementProvider>
          <KeyboardControls map={keyboardMap}>
            <InteractionBinder tooltip={tooltip} blocked={!!modalData || isFading} />
            <Canvas
              shadows
              dpr={[1, 1.5]}
              camera={{ position: [10, 10, 12], fov: 40 }}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
            >
              <AdaptiveDpr />
              <Suspense fallback={null}>
                {/* Keep the planet mounted so rotation / assets survive house trips */}
                <group visible={sceneMode === 'island'}>
                  <PlanetWorld
                    active={sceneMode === 'island'}
                    isFrozen={frozen || sceneMode !== 'island'}
                    globeQuatRef={globeQuatRef}
                    onEnterHouse={() => switchScene('interior')}
                    onOpenModal={setModalData}
                    setTooltip={setTooltip}
                  />
                </group>
                {sceneMode === 'interior' && (
                  <InteriorWorld
                    isFrozen={frozen}
                    onExitHouse={() => switchScene('island')}
                    onOpenModal={setModalData}
                    setTooltip={setTooltip}
                  />
                )}
              </Suspense>
            </Canvas>
            <LoaderScreen />
          </KeyboardControls>

          {isCoarse && !modalData && <VirtualJoystick />}
        </MovementProvider>
      </ErrorBoundary>

      <div className="scene-fade" style={{ opacity: isFading ? 1 : 0 }} />

      <Hud visible={hudOpen && !modalData} onDismiss={hideHud} />

      {tooltip && !modalData && !isFading && (
        <button type="button" className="tooltip" onClick={() => tooltip.action()}>
          {isCoarse ? 'Toca para' : <>Pulsa <kbd>E</kbd> para</>} {tooltip.text}
        </button>
      )}

      {modalData && (
        <div className="modal-backdrop" onClick={closeModal} role="presentation">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-title">{modalData.title}</h2>
            <p>{modalData.description}</p>
            {modalData.stack?.length > 0 && (
              <div className="modal-stack">
                {modalData.stack.map((group) => (
                  <div key={group.label} className="stack-group">
                    <h3>{group.label}</h3>
                    <div className="modal-tags">
                      {group.items.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {modalData.tags?.length > 0 && (
              <div className="modal-tags">
                {modalData.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            <div className="modal-actions">
              <button ref={closeBtnRef} type="button" className="btn-ghost" onClick={closeModal}>
                Cerrar (Esc)
              </button>
              {modalData.links?.map((link) => (
                <a key={link.href} className="btn-primary" href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
