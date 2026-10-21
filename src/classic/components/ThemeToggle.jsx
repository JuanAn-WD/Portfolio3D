import { ui } from '../data/content'
import { MoonIcon, SunIcon } from './Icons'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? ui.toLight : ui.toDark}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-leaf"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
