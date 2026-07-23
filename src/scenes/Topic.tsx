import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { useShowState } from '../hooks/useShowState'

// Themenkarte: Vollbild für Segmentwechsel. "SIGNAL 01 / TITEL".
export function Topic() {
  const [state] = useShowState()
  return (
    <Stage solid>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 340, right: 'var(--safe-x)' }}>
        <div className="reveal-up kicker kicker--red" style={{ fontSize: 26 }}>
          {state.segmentLabel}
        </div>
        <div className="hairline draw-x" style={{ margin: 'var(--space-8) 0', width: 420 }} />
        <div className="reveal-up reveal-up--d1 display" style={{ fontSize: 'var(--type-episode)', maxWidth: 1500 }}>
          {state.segmentTitle}
        </div>
      </div>
      <MetaRail episodeNumber={state.episodeNumber} right={`BUILD #${state.episodeNumber}`} showZehnx={state.showZehnx} />
    </Stage>
  )
}
