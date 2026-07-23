import { Stage } from '../components/Stage'
import { LiveBadge, Monogram } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'

// Szene 04 · Nur Screen: maximal reduziert, nichts verdeckt den Inhalt.
export function Screen() {
  const [state] = useShowState()
  return (
    <Stage>
      <div
        style={{
          position: 'absolute',
          top: 'var(--safe-y)',
          right: 'var(--safe-x)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        {state.showLogo && <Monogram size={30} />}
        {state.showLiveBadge && <LiveBadge size={14} live={state.isLive} />}
      </div>
      {state.showSegment && state.segmentLabel && (
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--safe-y)',
            left: 'var(--safe-x)',
            background: 'var(--bg-primary)',
            border: 'var(--line-hair) solid var(--border-subtle)',
            padding: 'var(--space-2) var(--space-4)',
          }}
        >
          <span className="kicker" style={{ color: 'var(--text-primary)', fontSize: 14 }}>
            {state.segmentLabel} · {state.segmentTitle}
          </span>
        </div>
      )}
    </Stage>
  )
}
