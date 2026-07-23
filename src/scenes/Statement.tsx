import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { useShowState } from '../hooks/useShowState'

// Kernaussagen-Karte: ein Satz, maximale typografische Wucht.
export function Statement() {
  const [state] = useShowState()
  return (
    <Stage solid>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', right: 'var(--safe-x)', top: 260 }}>
        <div className="reveal-up kicker kicker--red" style={{ fontSize: 22 }}>
          Kernaussage
        </div>
        <div
          className="reveal-up reveal-up--d1 display"
          style={{ fontSize: 120, marginTop: 'var(--space-12)', maxWidth: 1650 }}
        >
          {state.statement}
          <span className="block block--blink" style={{ marginLeft: '0.12em' }} />
        </div>
        <div className="reveal-up reveal-up--d3 meta" style={{ marginTop: 'var(--space-16)' }}>
          {state.statementSource}
        </div>
      </div>
      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
