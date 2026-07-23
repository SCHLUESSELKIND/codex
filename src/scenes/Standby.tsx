import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { EpisodeTag, LiveBadge, WordmarkStacked } from '../components/Logo'
import { useShowState, useCountdown, formatClock } from '../hooks/useShowState'

// Szene 01 · Standby: Vollbildkarte vor Sendungsstart.
export function Standby() {
  const [state] = useShowState()
  const remaining = useCountdown(state)
  const countdownActive = state.countdownStartedAt !== null

  return (
    <Stage solid>
      <div className="scanline" />

      <div style={{ position: 'absolute', top: 'var(--safe-y)', left: 'var(--safe-x)', display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
        <EpisodeTag number={state.episodeNumber} />
      </div>
      <div style={{ position: 'absolute', top: 'var(--safe-y)', right: 'var(--safe-x)' }}>
        <LiveBadge live={false} />
      </div>

      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 300 }}>
        <div className="reveal-up">
          <WordmarkStacked size={210} blink />
        </div>
        <div
          className="reveal-up reveal-up--d2 kicker"
          style={{ marginTop: 'var(--space-12)', color: 'var(--text-primary)', fontSize: 24 }}
        >
          Gleich geht&rsquo;s los
        </div>
        <div
          className="reveal-up reveal-up--d3"
          style={{ marginTop: 'var(--space-4)', fontSize: 'var(--type-body)', fontWeight: 500, color: 'var(--text-secondary)', maxWidth: 900 }}
        >
          {state.standbyTopic}
        </div>
      </div>

      {countdownActive && (
        <div style={{ position: 'absolute', right: 'var(--safe-x)', bottom: 160, textAlign: 'right' }}>
          <div className="kicker" style={{ marginBottom: 'var(--space-2)' }}>
            Start in
          </div>
          <div
            className="display"
            style={{ fontSize: 120, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-ui)', fontWeight: 900 }}
          >
            {formatClock(remaining)}
          </div>
        </div>
      )}

      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
