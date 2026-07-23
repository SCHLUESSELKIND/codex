import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { EpisodeTag } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'

// Technischer Fehlerzustand: ruhig, souverän, kein Witz.
export function Technical() {
  const [state] = useShowState()
  return (
    <Stage solid>
      <div style={{ position: 'absolute', top: 'var(--safe-y)', left: 'var(--safe-x)' }}>
        <EpisodeTag number={state.episodeNumber} />
      </div>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 420 }}>
        <div className="kicker" style={{ color: 'var(--warning)', fontSize: 20 }}>
          Status
        </div>
        <div className="display" style={{ fontSize: 120, marginTop: 'var(--space-6)' }}>
          Kurzer technischer Check
        </div>
        <div style={{ marginTop: 'var(--space-8)', fontSize: 24, fontWeight: 500, color: 'var(--text-secondary)' }}>
          Es geht in wenigen Momenten weiter. Der Stream bleibt online.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 'var(--space-12)' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 12,
                height: 12,
                background: 'var(--warning)',
                animation: `live-pulse 1.6s ease-in-out ${i * 0.25}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
