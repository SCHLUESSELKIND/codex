import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { EpisodeTag, LiveBadge, WordmarkStacked } from '../components/Logo'
import { useShowState, useCountdown, formatClock } from '../hooks/useShowState'
import { parseRundown } from '../state/showState'

/*
  Szene 01 · Standby.
  Haltung: keine leere Warteplatte, sondern der Sendeplan der Folge.
  Wer reinkommt, weiß in drei Sekunden, was heute passiert.
  Links Marke, rechts Ablauf, unten Countdown auf der Baseline.
*/

export function Standby() {
  const [state] = useShowState()
  const remaining = useCountdown(state)
  const countdownActive = state.countdownStartedAt !== null
  const rundown = parseRundown(state.rundown)

  return (
    <Stage solid>
      <div className="scanline" />

      <div style={{ position: 'absolute', top: 'var(--safe-y)', left: 'var(--safe-x)' }}>
        <EpisodeTag number={state.episodeNumber} />
      </div>
      <div style={{ position: 'absolute', top: 'var(--safe-y)', right: 'var(--safe-x)' }}>
        <LiveBadge live={false} />
      </div>

      {/* Marke oben links */}
      <div className="reveal-up" style={{ position: 'absolute', left: 'var(--safe-x)', top: 230 }}>
        <WordmarkStacked size={200} />
      </div>

      {/* Thema unten links, an der Metaleiste verankert */}
      <div style={{ position: 'absolute', left: 'var(--safe-x)', bottom: 190, width: 1000 }}>
        <div className="hairline draw-x" style={{ width: 620, marginBottom: 'var(--space-8)' }} />
        <div className="reveal-up reveal-up--d2 kicker kicker--red" style={{ fontSize: 20 }}>
          Gleich geht&rsquo;s los
        </div>
        <div
          className="reveal-up reveal-up--d3"
          style={{
            marginTop: 'var(--space-4)',
            fontSize: 34,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.25,
          }}
        >
          {state.standbyTopic}
        </div>
      </div>

      {/* Rechte Spalte: Ablauf der Folge */}
      <div style={{ position: 'absolute', right: 'var(--safe-x)', top: 230, width: 620 }}>
        <div className="kicker" style={{ marginBottom: 'var(--space-6)' }}>
          Ablauf
        </div>
        <div style={{ display: 'grid', gap: 2 }}>
          {rundown.map((item, i) => (
            <div
              key={item.label + i}
              className={`reveal-up reveal-up--d${Math.min(i + 1, 3)}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr',
                alignItems: 'baseline',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) 0',
                borderTop: 'var(--line-hair) solid var(--border-subtle)',
              }}
            >
              <span
                className="meta"
                style={{ fontSize: 15, color: i === 0 ? 'var(--signal-orange)' : 'var(--text-muted)' }}
              >
                {item.label}
              </span>
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.25 }}>
                {item.title}
              </span>
            </div>
          ))}
          <div style={{ borderTop: 'var(--line-hair) solid var(--border-subtle)' }} />
        </div>

        {countdownActive && (
          <div style={{ position: 'absolute', right: 0, top: 470, textAlign: 'right', width: 620 }}>
            <div className="kicker" style={{ marginBottom: 'var(--space-2)' }}>
              Start in
            </div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 128,
                lineHeight: 0.9,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              {formatClock(remaining)}
            </div>
          </div>
        )}
      </div>

      <MetaRail
        episodeNumber={state.episodeNumber}
        right="youtube.com/@tom_frerich"
        showZehnx={state.showZehnx}
      />
    </Stage>
  )
}
