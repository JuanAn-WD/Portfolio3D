// Tailwind solo actúa en los archivos con directivas @tailwind (src/classic/classic.css).
// El CSS del 3D (src/index.css) no tiene ninguna y sale tal cual.
export default {
  plugins: {
    tailwindcss: {},
  },
}
