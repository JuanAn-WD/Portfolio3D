const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

/**
 * Tailwind solo para la vista clásica (src/classic).
 * - content: solo esos archivos, así no se generan utilidades para el 3D.
 * - preflight desactivado: el reset va acotado a .classic-root en src/classic/classic.css.
 * - important: '.classic-root' cuelga todas las utilidades de ese contenedor,
 *   para que ninguna clase (por ejemplo .hidden o .fixed) llegue al HUD del 3D.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./src/classic/**/*.{js,jsx}'],
  important: '.classic-root',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        leaf: token('leaf'),
        sky: token('sky'),
        'on-accent': token('on-accent'),
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces Variable"', 'Georgia', 'Cambria', 'serif'],
      },
    },
  },
  plugins: [],
}
