import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { useShowState } from '../hooks/useShowState'
import { parseRundown } from '../state/showState'

/*
  Themenkarte für den Segmentwechsel.
  Links das Segment, rechts die Position im Ablauf. Wer einsteigt, sieht sofort,
  wo die Sendung gerade steht und was noch kommt. Das ist der Grund, warum die
  rechte Hälfte nicht leer bleibt: sie trägt Information, keine Dekoration.
*/

export function Topic() {
  const [state] = useShowState()
  const rundown = parseRundown(state.rundown)
  const activeIndex = rundown.findIndex(
    (item) => item.label.toLowerCase() === state.segmentLabel.trim().toLowerCase(),
  )

  return (
    <Stage solid>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 330, width: 1060 }}>
        <div className="reveal-up kicker kicker--red" style={{ fontSize: 26 }}>
          {state.segmentLabel}
        </div>
        <div className="hairline draw-x" style={{ margin: 'var(--space-8) 0', width: 420 }} />
        <div className="reveal-up reveal-up--d1 display" style={{ fontSize: 'var(--type-episode)' }}>
          {state.segmentTitle}
        </div>
      </div>

      {rundown.length > 0 && (
        <div style={{ position: 'absolute', right: 'var(--safe-x)', top: 330, width: 520 }}>
          <div className="kicker" style={{ marginBottom: 'var(--space-6)' }}>
            Ablauf
          </div>
          <div style={{ display: 'grid' }}>
            {rundown.map((item, i) => {
              const isActive = i === activeIndex
              const isPast = activeIndex >= 0 && i < activeIndex
              return (
                <div
                  key={item.label + i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-3) 0 var(--space-3) var(--space-4)',
                    borderTop: 'var(--line-hair) solid var(--border-subtle)',
                    borderLeft: isActive
                      ? 'var(--line-accent) solid var(--live-red)'
                      : 'var(--line-accent) solid transparent',
                    opacity: isPast ? 0.32 : 1,
                  }}
                >
                  <span
                    className="meta"
                    style={{ fontSize: 14, minWidth: 120, color: isActive ? 'var(--live-red)' : 'var(--text-muted)' }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: 19,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              )
            })}
            <div style={{ borderTop: 'var(--line-hair) solid var(--border-subtle)' }} />
          </div>
        </div>
      )}

      <MetaRail
        episodeNumber={state.episodeNumber}
        right={`BUILD #${state.episodeNumber}`}
        showZehnx={state.showZehnx}
      />
    </Stage>
  )
}
