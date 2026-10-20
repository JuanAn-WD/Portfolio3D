import { useEffect, useRef } from 'react'
import { profile } from '../config/content'

export function BrandIntro({ visible, onEnter }) {
  const enterRef = useRef(null)

  useEffect(() => {
    if (visible) enterRef.current?.focus()
  }, [visible])

  if (!visible) return null

  return (
    <div className="brand-intro" role="dialog" aria-modal="true" aria-labelledby="brand-intro-title">
      <div className="brand-intro-veil" aria-hidden="true" />
      <div className="brand-intro-content">
        <p className="brand-intro-role">{profile.role}</p>
        <h1 id="brand-intro-title" className="brand-intro-name">{profile.name}</h1>
        <p className="brand-intro-tagline">{profile.tagline}</p>
        <button
          id="explorar"
          ref={enterRef}
          type="button"
          className="btn-primary brand-intro-cta"
          onClick={onEnter}
        >
          Entrar al pueblo
        </button>
      </div>
    </div>
  )
}
