import { useEffect } from 'react'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './classic.css'
import { seo, ui } from './data/content'
import { useTheme } from './hooks/useTheme'
import About from './components/About'
import Contact from './components/Contact'
import Experience from './components/Experience'
import Header from './components/Header'
import Hero from './components/Hero'
import Hobbies from './components/Hobbies'
import Projects from './components/Projects'
import Stack from './components/Stack'

export default function ClassicApp() {
  const [theme, toggleTheme] = useTheme()

  // La página vuelve a hacer scroll mientras la clásica está montada (el 3D lo bloquea).
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('classic-active')
    if (!window.location.hash) window.scrollTo(0, 0)
    else document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    return () => {
      html.classList.remove('classic-active')
      window.scrollTo(0, 0)
    }
  }, [])

  // Título y descripción de la clásica (el 3D restaura los suyos al volver).
  useEffect(() => {
    document.title = seo.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  }, [])

  return (
    <div className={`classic-root${theme === 'dark' ? ' dark' : ''}`}>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-md bg-leaf px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {ui.skipLink}
      </a>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main id="contenido">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Stack />
        <Hobbies />
      </main>
      <Contact />
    </div>
  )
}
