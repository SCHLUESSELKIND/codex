import { useParams } from 'react-router-dom'
import { Stage } from '../components/Stage'
import { FailsMark } from '../components/FailsMark'
import { useShowState } from '../hooks/useShowState'
import { SEGMENTS, SEGMENT_ORDER, type Segment } from '../state/showState'

/*
  Kategorie-Bumper: die kurze Karte vor jedem Segment.

  Dauer etwa 3 Sekunden, dann wird zurück ins Sendebild überblendet.
  Aufbau in drei Schlägen, damit es sich wie geschnitten anfühlt und nicht
  wie eine Animation, die abläuft:
    1. Die Fläche fährt ein (240 ms)
    2. Der Name rastet ein (300 ms)
    3. Die Zeile darunter erscheint (360 ms)

  Die Farbfläche ist der frische Teil: jedes Segment hat seinen eigenen Ton,
  und weil die Karte nur drei Sekunden steht, darf sie laut sein. Genau dieser
  Kontrast zum ruhigen Sendebild macht den Rhythmus der Sendung.

  Route: /bumper/:segment  (intro · news · fails · build · outro)
*/

export function Bumper() {
  const { segment } = useParams<{ segment: string }>()
  const [state] = useShowState()

  const key = (SEGMENT_ORDER.includes(segment as Segment) ? segment : 'intro') as Segment
  const info = SEGMENTS[key]
  const position = SEGMENT_ORDER.indexOf(key) + 1

  // Die Farbfläche trägt bei fAILs und News dunkle Schrift, sonst helle.
  const dunkleSchrift = key === 'news' || key === 'fails'

  return (
    <Stage solid>
      {/* Farbbalken fährt von links ein und bleibt stehen */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 300,
          height: 480,
          right: 0,
          background: info.farbe,
          transformOrigin: 'left center',
          animation: 'draw-x 240ms var(--ease-snap) both',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          top: 300,
          height: 480,
          right: 'var(--safe-x)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 'var(--space-6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-6)',
            animation: 'reveal-up 300ms var(--ease-snap) 240ms both',
          }}
        >
          <span
            style={{
              font: '900 22px var(--font-ui)',
              letterSpacing: '0.3em',
              color: dunkleSchrift ? 'rgba(6,6,6,0.55)' : 'rgba(244,244,241,0.5)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(position).padStart(2, '0')} / {SEGMENT_ORDER.length}
          </span>
          <div
            style={{
              flex: 1,
              height: 2,
              background: dunkleSchrift ? 'rgba(6,6,6,0.25)' : 'rgba(244,244,241,0.25)',
            }}
          />
        </div>

        <div style={{ animation: 'reveal-up 300ms var(--ease-snap) 300ms both' }}>
          {key === 'fails' ? (
            <FailsMark size={168} farbe="#150a02" style={{ color: '#150a02' }} />
          ) : (
            <span
              className="display"
              style={{
                fontSize: 168,
                lineHeight: 0.92,
                color: dunkleSchrift ? '#150a02' : 'var(--bg-primary)',
              }}
            >
              {info.label}
            </span>
          )}
        </div>

        <div
          style={{
            animation: 'reveal-up 360ms var(--ease-snap) 420ms both',
            font: '700 34px var(--font-ui)',
            color: dunkleSchrift ? 'rgba(6,6,6,0.72)' : 'rgba(6,6,6,0.72)',
          }}
        >
          {info.claim}
        </div>
      </div>

      {/* Episodenkennung unten, hält die Karte in der Serie */}
      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          bottom: 'var(--safe-y)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          animation: 'reveal-up 300ms var(--ease-snap) 500ms both',
        }}
      >
        <span className="display" style={{ fontSize: 26 }}>
          BUILD<span className="block" style={{ marginLeft: 4 }} />
        </span>
        <span
          style={{
            font: '800 17px var(--font-ui)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          On Purpose
        </span>
        <span className="meta">#{state.episodeNumber}</span>
      </div>
    </Stage>
  )
}
