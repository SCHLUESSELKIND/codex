import { ZehnxMark } from './Logo'

// Technische Metaleiste am unteren Stage-Rand: Koordinaten, Episode, Herkunft.
// Reines Intelligence-Detail, immer leise, nie im Weg.
export function MetaRail({
  episodeNumber,
  right,
  showZehnx = true,
}: {
  episodeNumber: string
  right?: string
  showZehnx?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 'var(--safe-x)',
        right: 'var(--safe-x)',
        bottom: 'var(--safe-y)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
      }}
    >
      <span className="meta">BOP·E{episodeNumber}</span>
      <span className="meta" style={{ color: 'var(--signal-orange)' }}>
        ·
      </span>
      <span className="meta">KÖLN 50.94°N 6.96°O</span>
      <div className="hairline" style={{ flex: 1 }} />
      {right && <span className="meta">{right}</span>}
      {showZehnx && <ZehnxMark />}
    </div>
  )
}
