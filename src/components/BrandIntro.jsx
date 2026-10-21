import { useEffect, useRef } from 'react'
import { profile } from '../config/content'
import { VIEW_CLASSIC, handleViewLinkClick, viewHref } from '../helpers/viewMode'

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
        <div className="brand-intro-actions">
          <button
            id="explorar"
            ref={enterRef}
            type="button"
            className="btn-primary brand-intro-cta"
            onClick={onEnter}
          >
            Entrar al planeta
          </button>
          <a
            className="btn-ghost brand-intro-alt"
            href={viewHref(VIEW_CLASSIC)}
            onClick={(e) => handleViewLinkClick(e, VIEW_CLASSIC)}
          >
            Ver portfolio clásico
          </a>
        </div>
      </div>
    </div>
  )
}
