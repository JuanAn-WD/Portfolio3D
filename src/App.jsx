import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'

import { keyboardMap } from './config/keyboardMap'
import { PlanetWorld } from './scenes/PlanetWorld'
import { InteriorWorld } from './scenes/InteriorWorld'

// -------------------------------------------------------------
// 🎬 APP PRINCIPAL
// -------------------------------------------------------------

/**
 * Root app: switches between the exterior planet scene and the interior house scene,
 * and renders the tooltip / info modal overlays on top of the 3D canvas.
 */
export default function App() {
  const [sceneMode, setSceneMode] = useState('island')
  const [isFading, setIsFading] = useState(false)
  const [tooltip, setTooltip] = useState(null)
  const [modalData, setModalData] = useState(null)

  // Fades to black, swaps the active scene, then fades back in
  const switchScene = useCallback((nextScene) => {
    setIsFading(true)
    setTooltip(null)
    setTimeout(() => {
      setSceneMode(nextScene)
      setTimeout(() => setIsFading(false), 200)
    }, 400)
  }, [])

  // Closes the info modal and returns keyboard focus to the window
  const closeModal = useCallback(() => {
    setModalData(null)
    window.focus()
  }, [])

  // Global key listener: 'E' triggers the current tooltip action, 'Escape' closes the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'e' || e.key === 'E') && tooltip && !modalData && !isFading) {
        tooltip.action()
      } else if (e.key === 'Escape' && modalData) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tooltip, modalData, isFading, closeModal])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#0f172a' }} onClick={() => window.focus()}>
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows camera={{ position: [10, 10, 12], fov: 40 }}>
          {sceneMode === 'island' ? (
            <PlanetWorld isFrozen={isFading || !!modalData} onEnterHouse={() => switchScene('interior')} onOpenModal={setModalData} setTooltip={setTooltip} />
          ) : (
            <InteriorWorld isFrozen={isFading || !!modalData} onExitHouse={() => switchScene('island')} onOpenModal={setModalData} setTooltip={setTooltip} />
          )}
        </Canvas>
      </KeyboardControls>

      {/* Overlay negro para la transición de fade entre escenas */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#090d16', pointerEvents: 'none', opacity: isFading ? 1 : 0, transition: 'opacity 0.4s ease-in-out', zIndex: 50 }} />

      {/* Tooltip flotante de interacción */}
      {tooltip && !modalData && !isFading && (
        <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', color: '#ffffff', padding: '12px 28px', borderRadius: '30px', fontFamily: 'system-ui, sans-serif', fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', pointerEvents: 'none', zIndex: 40 }}>
          💡 Presiona <span style={{ backgroundColor: '#2563eb', padding: '3px 9px', borderRadius: '6px', margin: '0 4px' }}>E</span> para {tooltip.text}
        </div>
      )}

      {/* Modal de información de proyecto */}
      {modalData && (
        <div onClick={closeModal} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#1e293b', color: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '520px', width: '90%', fontFamily: 'system-ui, sans-serif', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#60a5fa' }}>{modalData.title}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '15px' }}>{modalData.description}</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0' }}>
              {modalData.tags?.map((tag) => <span key={tag} style={{ backgroundColor: '#334155', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{tag}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={closeModal} style={{ backgroundColor: '#475569', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cerrar (Esc)</button>
              {modalData.link && <a href={modalData.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>Ver en GitHub ↗</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
