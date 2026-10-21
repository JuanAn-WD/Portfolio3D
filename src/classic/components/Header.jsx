import { useEffect, useRef, useState } from 'react'
import { nav, profile, ui } from '../data/content'
import { CloseIcon, GithubIcon, MenuIcon } from './Icons'
import ThemeToggle from './ThemeToggle'
import { btnPrimary } from './ui'

export default function Header({ theme, onToggleTheme }) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const linkClass =
    'rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink'

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <a href="#inicio" className="rounded-md font-serif text-xl font-semibold tracking-tight">
          {profile.name}
        </a>

        <nav aria-label={ui.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={linkClass}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ui.github} ${ui.newTab}`}
            className={`${btnPrimary} h-10 !px-3 sm:!px-5`}
          >
            <GithubIcon />
            <span className="hidden sm:inline">{ui.github}</span>
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={menuButton}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? ui.closeMenu : ui.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="menu-movil" hidden={!open} className="border-t border-line bg-bg lg:hidden">
        <nav aria-label={ui.mainNav} className="mx-auto max-w-5xl px-5 py-3">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-3 text-base font-medium text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
