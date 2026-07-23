import { EpisodeTag, LiveBadge, WordmarkHorizontal } from './Logo'
import type { ShowState } from '../state/showState'

// Obere Overlay-Leiste für Kamera- und Build-Szene:
// links Marke + Episode, rechts LIVE. Bewusst schwerelos, kein Rahmen.
export function TopBar({ state, segment }: { state: ShowState; segment?: string }) {
  return (
    <>
      {/* Scrim statt Rahmen: sichert die Lesbarkeit der hellen Marke, wenn
          darunter ein helles Videobild liegt (weiße Wand, helle Website).
          Kein Kasten, keine Kante, das Bild bleibt offen. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 210,
          background:
            'linear-gradient(180deg, rgba(6,6,6,0.58) 0%, rgba(6,6,6,0.26) 42%, rgba(6,6,6,0) 100%)',
          pointerEvents: 'none',
        }}
      />
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
