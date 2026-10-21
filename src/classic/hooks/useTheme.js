import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function readInitialTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/**
 * Modo oscuro por defecto; solo pasa a claro si la persona lo eligió.
 * La clase .dark va en el contenedor .classic-root (no en <html>), así el 3D no se entera.
 * En <html> solo se marca classic-light para el color del fondo al hacer overscroll.
 */
export function useTheme() {
  const [theme, setTheme] = useState(readInitialTheme)

  useEffect(() => {
    const html = document.documentElement
    html.classList.toggle('classic-light', theme === 'light')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* almacenamiento no disponible */
    }
    return () => html.classList.remove('classic-light')
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return [theme, toggle]
}
