import { useId } from 'react'
import './HoneyVessel.css'

// A glass column of honey held up to the light. Colours come from the catalogue.
// With `pour`, the honey rises once on load (skipped under reduced motion).
export default function HoneyVessel({ colour, fill = 0.82, pour = false, delay = 0, label, className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const top = 8 + (1 - fill) * 284
  const tube = 'M10 8 V252 A40 40 0 0 0 90 252 V8 Z'

  return (
    <svg
      className={`vessel ${pour ? 'vessel--pour' : ''} ${className}`}
      viewBox="0 0 100 300"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
      style={{ '--pour-delay': `${delay}ms` }}
    >
      <defs>
        <linearGradient id={`honey-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colour.light} />
          <stop offset="0.45" stopColor={colour.base} />
          <stop offset="1" stopColor={colour.deep} />
        </linearGradient>
        {/* Light passing through: a warm glow in the honey's own lightest tone */}
        <radialGradient id={`light-${id}`} cx="0.42" cy="0.4" r="0.55">
          <stop offset="0" stopColor={colour.light} stopOpacity="0.7" />
          <stop offset="1" stopColor={colour.light} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`tube-${id}`}>
          <path d={tube} />
        </clipPath>
      </defs>

      <path d={tube} className="vessel__glass" />
      <g clipPath={`url(#tube-${id})`}>
        <g className="vessel__honey">
          <rect x="0" y={top} width="100" height={300 - top} fill={`url(#honey-${id})`} />
          <rect x="0" y={top} width="100" height={300 - top} fill={`url(#light-${id})`} />
          <ellipse cx="50" cy={top} rx="40" ry="3.5" fill={colour.light} opacity="0.9" />
        </g>
        <rect x="19" y="18" width="5" height="250" rx="2.5" className="vessel__shine" />
      </g>
      <path d="M5 8 H95" className="vessel__lip" />
    </svg>
  )
}
