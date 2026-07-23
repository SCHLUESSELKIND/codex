import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { EpisodeTag } from '../components/Logo'
import { useShowState, useCountdown, formatClock } from '../hooks/useShowState'

// Pausenkarte: ruhig, kein Entertainment-Modus.
export function Break() {
  const [state] = useShowState()
  const remaining = useCountdown(state)
  return (
    <Stage solid>
      <div className="scanline" />
      <div style={{ position: 'absolute', top: 'var(--safe-y)', left: 'var(--safe-x)' }}>
        <EpisodeTag number={state.episodeNumber} />
      </div>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 400 }}>
        <div className="reveal-up display" style={{ fontSize: 150 }}>
          Kurze Pause
        </div>
        <div className="reveal-up reveal-up--d2 kicker" style={{ marginTop: 'var(--space-8)', fontSize: 22, color: 'var(--text-primary)' }}>
          Wir sind gleich zurück
        </div>
      </div>
      {state.countdownStartedAt !== null && (
        <div style={{ position: 'absolute', right: 'var(--safe-x)', bottom: 160, textAlign: 'right' }}>
          <div
            style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 96, fontVariantNumeric: 'tabular-nums' }}
          >
            {formatClock(remaining)}
          </div>
        </div>
      )}
      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
