import { ui } from '../data/content'
import { ExternalIcon } from './Icons'

// Enlace que abre en pestaña nueva y lo avisa a lectores de pantalla.
export default function ExternalLink({ href, className, icon, srContext, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {icon}
      <span>
        {children}
        {srContext && <span className="sr-only"> {srContext}</span>}
        <span className="sr-only"> {ui.newTab}</span>
      </span>
      {!icon && <ExternalIcon />}
    </a>
  )
}
