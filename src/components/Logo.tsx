import type { CSSProperties } from 'react'

/*
  Logo-System BUILD ON PURPOSE.
  Entscheidung: gestapeltes Wordmark mit Baustein-Cursor.
  BUILD trägt den roten Baustein (der kleinste Build-Schritt,
  zugleich Blinkcursor = es wird gerade gebaut).
  ON PURPOSE steht als gesperrte Präzisionszeile darunter.
*/

interface WordmarkProps {
  size?: number // Höhe der BUILD-Zeile in px
  blink?: boolean
  style?: CSSProperties
}

export function WordmarkStacked({ size = 96, blink = false, style }: WordmarkProps) {
  return (
    <div style={{ display: 'inline-block', lineHeight: 1, ...style }}>
      <div
        className="display"
        style={{ fontSize: size, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
      >
        BUILD<span className={`block${blink ? ' block--blink' : ''}`} style={{ marginLeft: '0.09em' }} />
      </div>
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: size * 0.208,
          letterSpacing: '0.435em',
          marginTop: size * 0.14,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          color: 'var(--text-primary)',
        }}
      >
        ON PURPOSE
      </div>
    </div>
  )
}

export function WordmarkHorizontal({ size = 32, blink = false, style }: WordmarkProps) {
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: size * 0.4, whiteSpace: 'nowrap', ...style }}
    >
      <span className="display" style={{ fontSize: size }}>
        BUILD
        <span className={`block${blink ? ' block--blink' : ''}`} style={{ marginLeft: '0.09em' }} />
      </span>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: size * 0.62,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
        }}
      >
        ON PURPOSE
      </span>
    </div>
  )
}

/** Monogramm: B + Baustein. Funktioniert bis 48px herunter. */
export function Monogram({ size = 64, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', lineHeight: 1, ...style }}>
      <span className="display" style={{ fontSize: size }}>
        B
      </span>
      <span className="block" style={{ fontSize: size * 0.58, marginLeft: size * 0.07 }} />
    </div>
  )
}

export function EpisodeTag({ number, size = 18 }: { number: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.5,
        border: 'var(--line-hair) solid var(--border-strong)',
        padding: `${size * 0.42}px ${size * 0.7}px`,
        fontFamily: 'var(--font-ui)',
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 'var(--tracking-wide)',
        fontVariantNumeric: 'tabular-nums',
        textTransform: 'uppercase',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
      }}
    >
      BUILD&nbsp;#{number}
    </span>
  )
}

export function LiveBadge({ size = 18, live = true }: { size?: number; live?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.55,
        background: live ? 'var(--live-red)' : 'transparent',
        border: live ? 'none' : 'var(--line-hair) solid var(--border-strong)',
        color: live ? '#0a0202' : 'var(--text-muted)',
        padding: live ? `${size * 0.42}px ${size * 0.75}px` : `${size * 0.42 - 1}px ${size * 0.75 - 1}px`,
        fontFamily: 'var(--font-ui)',
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: 'currentColor',
          animation: live ? 'live-pulse 1.6s ease-in-out infinite' : 'none',
        }}
      />
      {live ? 'Live' : 'Standby'}
    </span>
  )
}

export function ZehnxMark({ size = 14 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 'var(--tracking-meta)',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}
    >
      Von Zehn<span style={{ color: 'var(--signal-orange)' }}>X</span>
    </span>
  )
}
