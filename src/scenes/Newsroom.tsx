import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { LiveBadge, WordmarkHorizontal } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'
import { parseNews } from '../state/showState'

/*
  Newsroom für das NEWS-Segment.

  Aufbau: links das Kamerafenster, rechts die Meldungen als Liste. Die gerade
  besprochene Meldung ist gesetzt, die anderen warten sichtbar. Damit weiß der
  Zuschauer immer, wo in der Rubrik er sich befindet, ohne dass jemand es sagt.

  Der Unterschied zur klassischen Nachrichtenoptik: keine Laufschrift, kein
  Ticker, keine rotierenden Kacheln. Meldungen stehen still, weil sie gelesen
  werden sollen, nicht beeindrucken.

  Das Kamerafenster ist nur ein Rahmen, die Kamera liegt in OBS darunter.
*/

/* Kamera links, 16:9, vertikal in der Inhaltszone verankert. Darunter bleibt
   Platz für die Sprecherzeile, damit die linke Spalte nicht unten abbricht. */
const CAM = { x: 96, y: 196, width: 848, height: 477 }

export function Newsroom() {
  const [state] = useShowState()
  const items = parseNews(state.newsItems).slice(0, 6)

  return (
    <Stage>
      {/* Kopfzeile */}
      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          top: 'var(--safe-y)',
          right: 'var(--safe-x)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {state.showLogo && <WordmarkHorizontal size={24} />}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--signal-orange)',
            color: '#150a02',
            padding: '8px 14px',
            font: '900 15px var(--font-ui)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          News
        </span>
        <span
          style={{
            font: '700 20px var(--font-ui)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          Was diese Woche wirklich zählt
        </span>
        {state.showLiveBadge && <LiveBadge size={14} live={state.isLive} />}
      </div>

      {/* Kamerafenster links, nur Kante */}
      {/* left/top statt x/y: CSS kennt x und y nicht für die Positionierung,
          ein Spread der Rohwerte landet sonst still in der linken oberen Ecke. */}
      <div
        style={{
          position: 'absolute',
          left: CAM.x,
          top: CAM.y,
          width: CAM.width,
          height: CAM.height,
          border: 'var(--line-hair) solid var(--panel-border)',
          pointerEvents: 'none',
        }}
      />

      {/* Sprecherzeile unter der Kamera, damit die linke Spalte trägt */}
      <div style={{ position: 'absolute', left: CAM.x, top: CAM.y + CAM.height + 28, width: CAM.width }}>
        <div className="kicker kicker--orange" style={{ marginBottom: 8 }}>
          {state.presenterRole}
        </div>
        <div className="display" style={{ fontSize: 44 }}>
          {state.presenterName}
        </div>
      </div>

      {/* Meldungen rechts */}
      <div style={{ position: 'absolute', left: 992, top: 196, width: 832 }}>
        <div className="kicker" style={{ marginBottom: 'var(--space-4)' }}>
          Meldungen
        </div>
        <div style={{ display: 'grid' }}>
          {items.map((item, i) => {
            const aktiv = i === state.newsAktiv
            const erledigt = state.newsAktiv >= 0 && i < state.newsAktiv
            return (
              <div
                key={item.label + i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-6) 0 var(--space-6) var(--space-4)',
                  borderTop: 'var(--line-hair) solid var(--border-subtle)',
                  borderLeft: aktiv
                    ? 'var(--line-accent) solid var(--signal-orange)'
                    : 'var(--line-accent) solid transparent',
                  background: aktiv ? 'var(--panel)' : 'transparent',
                  opacity: erledigt ? 0.3 : 1,
                  transition: 'opacity var(--motion-reveal) var(--ease-snap)',
                }}
              >
                <span
                  className="meta"
                  style={{
                    fontSize: 14,
                    minWidth: 44,
                    color: aktiv ? 'var(--signal-orange)' : 'var(--text-muted)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    className="meta"
                    style={{
                      fontSize: 13,
                      marginBottom: 4,
                      color: aktiv ? 'var(--signal-orange)' : 'var(--text-muted)',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      font: `${aktiv ? 800 : 600} ${aktiv ? 30 : 25}px var(--font-ui)`,
                      lineHeight: 1.22,
                      color: aktiv ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.title}
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ borderTop: 'var(--line-hair) solid var(--border-subtle)' }} />
        </div>
      </div>

      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
