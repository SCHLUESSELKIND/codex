import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { WordmarkStacked } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'

// Endkarte: Dank, nächste Folge, Abo-Hinweis, Herkunft.
export function End() {
  const [state] = useShowState()
  return (
    <Stage solid>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 260 }}>
        <div className="reveal-up kicker" style={{ fontSize: 22 }}>
          Das war
        </div>
        <div className="reveal-up reveal-up--d1" style={{ marginTop: 'var(--space-6)' }}>
          <WordmarkStacked size={170} />
        </div>
        <div className="hairline draw-x" style={{ margin: 'var(--space-16) 0', width: 640 }} />
        <div className="reveal-up reveal-up--d2" style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>{state.nextShowText}</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-secondary)' }}>
            Abonnieren: youtube.com/@tom_frerich
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text-secondary)' }}>
            Mehr Praxis: zehnx.me
          </div>
        </div>
      </div>
      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
