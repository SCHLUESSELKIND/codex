import { Stage } from '../components/Stage'
import { ChallengeClock, useChallengeRest, clockFarbe } from '../components/ChallengeClock'
import { LiveBadge, WordmarkHorizontal } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'
import type { ShowState } from '../state/showState'
import geometry from '../data/geometry.json'

/*
  Die Sendeoberfläche der 45-Minuten-Challenge.

  Haltung: Das Bild ist ein Arbeitsplatz, kein Plakat. Vier Fenster mit klarer
  Aufgabe, dazwischen echte Kanten. Der Zuschauer soll jederzeit ohne Erklärung
  sehen: was gebaut wird, wie lange noch, wie weit es ist, und was im Chat läuft.

  Die Fenster sind nur Rahmen. Screen, Kamera und Chat liegen in OBS DARUNTER,
  exakt auf den Koordinaten aus data/geometry.json. Deshalb bleibt hier alles
  transparent, außer den Panels, die eigene Information tragen.
*/

const G = geometry.challenge

/** Ein Fensterrahmen mit Beschriftung. Zeichnet nur die Kante, nie eine Füllung. */
function Fenster({
  x,
  y,
  width,
  height,
  titel,
  akzent = false,
}: {
  x: number
  y: number
  width: number
  height: number
  titel: string
  akzent?: boolean
}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width,
          height,
          border: `var(--line-hair) solid ${akzent ? 'var(--live-red)' : 'var(--panel-border)'}`,
          pointerEvents: 'none',
        }}
      />
      {/* Beschriftung sitzt auf der Oberkante, damit sie kein Bild verdeckt */}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y - 26,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            background: akzent ? 'var(--live-red)' : 'var(--text-muted)',
          }}
        />
        <span
          style={{
            font: '800 13px var(--font-ui)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: akzent ? 'var(--live-red)' : 'var(--text-muted)',
          }}
        >
          {titel}
        </span>
      </div>
    </>
  )
}

/*
  Die Zeitschiene direkt unter der Kopfzeile.
  Absichtlich nur 6 px hoch: sie soll im Augenwinkel wirken, nicht ablenken.
  Die Marken bei 30, 15 und 5 Minuten geben dem Verlauf eine Skala, damit
  man Fortschritt schätzen kann, ohne die Ziffern zu lesen.
*/
function Zeitschiene({ state }: { state: ShowState }) {
  const rest = useChallengeRest(state)
  const gesamt = Math.max(1, state.challengeMinuten * 60)
  const anteil = Math.max(0, Math.min(1, rest / gesamt))
  const farbe = clockFarbe(state, rest)
  const marken = [30, 15, 5].filter((m) => m * 60 < gesamt)

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 78, height: 6 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--clock-track)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformOrigin: 'left center',
          transform: `scaleX(${anteil})`,
          background: farbe,
          transition: 'transform 400ms linear, background 400ms ease',
        }}
      />
      {marken.map((m) => (
        <div
          key={m}
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            left: `${(1 - (m * 60) / gesamt) * 100}%`,
            width: 2,
            background: 'var(--bg-primary)',
          }}
        />
      ))}
    </div>
  )
}

function Panel({
  x,
  y,
  width,
  height,
  children,
}: {
  x: number
  y: number
  width: number
  height: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        background: 'var(--panel)',
        border: 'var(--line-hair) solid var(--panel-border)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

export function Challenge() {
  const [state] = useShowState()
  const erfuellt = state.challengeKriterien.filter((k) => k.erfuellt).length
  const gesamt = state.challengeKriterien.length

  return (
    <Stage>
      {/* Scrim unter der Kopfzeile: sichert die Lesbarkeit, wenn darunter ein
          heller Bildschirminhalt liegt. Kein Kasten, nur ein weicher Verlauf. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 130,
          background: 'linear-gradient(180deg, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Kopfzeile: Marke, gelocktes Ziel, LIVE */}
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 30,
          right: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {state.showLogo && <WordmarkHorizontal size={22} />}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: state.challengeGelockt ? 'var(--live-red)' : 'transparent',
            border: state.challengeGelockt ? 'none' : 'var(--line-hair) solid var(--border-strong)',
            color: state.challengeGelockt ? '#0a0202' : 'var(--text-muted)',
            padding: '7px 12px',
            font: '900 13px var(--font-ui)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {state.challengeGelockt ? 'Ziel gelockt' : 'Ziel offen'}
        </span>
        <span
          style={{
            font: '800 24px var(--font-ui)',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {state.challengeTitel}
        </span>
        {state.showLiveBadge && <LiveBadge size={13} live={state.isLive} />}
      </div>

      {/* Zeitschiene über die volle Breite. Sie ist das Element, das die
          Challenge trägt: man sieht den Verlauf der 45 Minuten, ohne die Uhr
          zu lesen. Läuft von links nach rechts leer, wechselt die Farbe mit
          der Dringlichkeit. */}
      <Zeitschiene state={state} />

      {/* Arbeitsfenster: Screen und Chat liegen in OBS darunter */}
      <Fenster {...G.screen} titel="Werkstatt" akzent />
      {state.showChat && <Fenster {...G.chat} titel="Chat" />}
      <Fenster {...G.camera} titel="Kamera" />

      {/* Uhr */}
      <Panel {...G.clock}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ChallengeClock state={state} size={248} />
        </div>
      </Panel>

      {/* Ergebnis-Lock: die Abnahmekriterien, live abhakbar */}
      <Panel {...G.lock}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span
            style={{
              font: '800 13px var(--font-ui)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Fertig ist es, wenn
          </span>
          <span
            style={{
              font: '900 17px var(--font-ui)',
              fontVariantNumeric: 'tabular-nums',
              color: erfuellt === gesamt ? 'var(--success)' : 'var(--text-primary)',
            }}
          >
            {erfuellt}/{gesamt}
          </span>
        </div>

        <div style={{ display: 'grid', gap: 7 }}>
          {state.challengeKriterien.slice(0, 5).map((k, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              {/* Kästchen füllt sich, kein Haken-Icon: bleibt bei Kompression lesbar */}
              <span
                style={{
                  width: 15,
                  height: 15,
                  flex: 'none',
                  marginTop: 2,
                  background: k.erfuellt ? 'var(--success)' : 'transparent',
                  border: k.erfuellt ? 'none' : 'var(--line-hair) solid var(--border-strong)',
                  transition: 'background var(--motion-micro) var(--ease-snap)',
                }}
              />
              <span
                style={{
                  font: '600 15px var(--font-ui)',
                  lineHeight: 1.3,
                  color: k.erfuellt ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: k.erfuellt ? 'line-through' : 'none',
                }}
              >
                {k.text}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* Hervorgehobene Zuschauerfrage, liegt über dem Chatfenster */}
      {state.chatFrage.trim() && (
        <div
          className="reveal-up"
          style={{
            position: 'absolute',
            left: G.chat.x,
            top: G.chat.y,
            width: G.chat.width,
            height: G.chat.height,
            background: 'var(--panel-raised)',
            borderLeft: 'var(--line-accent) solid var(--signal-orange)',
            border: 'var(--line-hair) solid var(--panel-border)',
            borderLeftWidth: 'var(--line-accent)',
            borderLeftColor: 'var(--signal-orange)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              font: '800 13px var(--font-ui)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--signal-orange)',
              marginBottom: 8,
            }}
          >
            Aus dem Chat{state.chatAutor ? ` · ${state.chatAutor}` : ''}
          </div>
          <div style={{ font: '700 27px var(--font-ui)', lineHeight: 1.25 }}>{state.chatFrage}</div>
        </div>
      )}
    </Stage>
  )
}
