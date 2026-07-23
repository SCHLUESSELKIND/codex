import { EpisodeTag, LiveBadge, WordmarkHorizontal } from './Logo'
import type { ShowState } from '../state/showState'

// Obere Overlay-Leiste für Kamera- und Build-Szene:
// links Marke + Episode, rechts LIVE. Bewusst schwerelos, kein Rahmen.
export function TopBar({ state, segment }: { state: ShowState; segment?: string }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 'var(--safe-y)',
          left: 'var(--safe-x)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {state.showLogo && <WordmarkHorizontal size={30} />}
        {state.showEpisode && <EpisodeTag number={state.episodeNumber} size={15} />}
        {segment && state.showSegment && (
          <span className="kicker" style={{ color: 'var(--text-primary)' }}>
            {segment}
          </span>
        )}
      </div>
      {state.showLiveBadge && (
        <div style={{ position: 'absolute', top: 'var(--safe-y)', right: 'var(--safe-x)' }}>
          <LiveBadge size={16} live={state.isLive} />
        </div>
      )}
    </>
  )
}
