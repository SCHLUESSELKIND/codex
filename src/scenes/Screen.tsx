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
        {/* Sender-Bug auf eigener Platte: die Screen-Szene liegt über beliebigem
            Inhalt, von dunklem Editor bis weißer Website. Ohne Träger
            verschwindet die helle Marke im hellen Untergrund. */}
        {state.showLogo && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'var(--bg-primary)',
              border: 'var(--line-hair) solid var(--border-subtle)',
              padding: '8px 12px',
            }}
          >
            <Monogram size={26} />
          </span>
        )}
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
