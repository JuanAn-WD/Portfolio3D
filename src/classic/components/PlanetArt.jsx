import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const CX = 600
const CY = 1120
const TOP = 220 // y de la superficie del planeta

// Casas y árboles repartidos por el borde; el mundo gira, el personaje se queda arriba.
const props = Array.from({ length: 36 }, (_, i) => ({
  angle: i * 10 + 3,
  kind: i % 3 === 0 ? 'house' : 'tree',
})).filter((_, i) => i % 4 !== 1)

export default function PlanetArt({ className }) {
  const reduced = usePrefersReducedMotion()

  return (
    <svg
      viewBox="0 120 1200 260"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <radialGradient id="planet-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ stopColor: 'rgb(var(--sky))', stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--sky))', stopOpacity: 0 }} />
        </radialGradient>
        {/* Funde la parte de abajo con el fondo para que el planeta no acabe en un corte seco */}
        <linearGradient id="planet-fade" gradientUnits="userSpaceOnUse" x1="0" y1="230" x2="0" y2="380">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="planet-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="420">
          <rect width="1200" height="420" fill="url(#planet-fade)" />
        </mask>
        <linearGradient id="planet-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'rgb(var(--surface))' }} />
          <stop offset="1" style={{ stopColor: 'rgb(var(--bg))' }} />
        </linearGradient>
      </defs>

      <g mask="url(#planet-mask)">
        <ellipse cx={CX} cy={TOP} rx="560" ry="100" fill="url(#planet-glow)" />
        <circle cx={CX} cy={CY} r="900" fill="url(#planet-fill)" strokeWidth="2" className="stroke-leaf/50" />

        <g>
          {!reduced && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="360s"
              repeatCount="indefinite"
            />
          )}
          {props.map(({ angle, kind }) => (
            <g key={angle} transform={`rotate(${angle} ${CX} ${CY}) translate(${CX} ${TOP})`} className="fill-leaf/60">
              {kind === 'house' ? (
                <>
                  <rect x="-13" y="-16" width="26" height="16" />
                  <polygon points="-17,-16 0,-30 17,-16" />
                </>
              ) : (
                <>
                  <rect x="-2" y="-9" width="4" height="9" />
                  <circle cy="-17" r="9" />
                </>
              )}
            </g>
          ))}
        </g>
      </g>

      {/* Personaje: con un contorno del color del fondo para que los árboles y casas
          que pasan por detrás no se monten visualmente sobre él (sobre todo en modo claro). */}
      <g className="fill-sky stroke-bg" strokeWidth="5" style={{ paintOrder: 'stroke' }}>
        <rect x={CX - 6} y={TOP - 26} width="12" height="26" rx="5" />
        <circle cx={CX} cy={TOP - 36} r="8" />
      </g>
    </svg>
  )
}
