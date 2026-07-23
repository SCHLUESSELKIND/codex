import { useSearchParams } from 'react-router-dom'
import { Stage } from '../components/Stage'
import { WordmarkStacked } from '../components/Logo'

/*
  Kanalbanner · 2560x1440.
  Safe Area aller Geräte: 1546x423, zentriert. Alles Wesentliche liegt darin.
  Der Rand trägt nur Struktur (Raster, Datenmarken), die auf TV sichtbar wird.
  ?guides=1 blendet die Safe-Area-Rahmen ein.
*/

const SAFE_W = 1546
const SAFE_H = 423

export function Banner() {
  const [params] = useSearchParams()
  const guides = params.get('guides') === '1'

  return (
    <Stage width={2560} height={1440} solid>
      {/* Technisches Raster über die volle Fläche */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(244,244,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,244,241,0.05) 1px, transparent 1px)',
          backgroundSize: '160px 160px',
        }}
      />

      {/* Datenmarken am oberen und unteren Rand (nur auf TV/Desktop sichtbar) */}
      <div style={{ position: 'absolute', top: 120, left: 160, right: 160, display: 'flex', gap: 28 }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: i % 6 === 0 ? 26 : 12,
              background: i % 6 === 0 ? 'var(--signal-orange)' : 'var(--border-subtle)',
              opacity: i % 6 === 0 ? 0.9 : 1,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: SAFE_W,
          height: SAFE_H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 80,
        }}
      >
        <div>
          <WordmarkStacked size={168} blink={false} />
          <div
            style={{
              marginTop: 40,
              font: '700 34px var(--font-ui)',
              letterSpacing: '0.02em',
              color: 'var(--text-secondary)',
            }}
          >
            KI bauen. Im echten Arbeitsalltag.
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'grid', gap: 22, justifyItems: 'end' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--live-red)',
              color: '#0a0202',
              padding: '14px 22px',
              font: '900 26px var(--font-ui)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: 14, height: 14, background: 'currentColor' }} />
            Jede Woche live
          </span>
          <span
            style={{
              font: '700 28px var(--font-ui)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            mit Thomas Frerich
          </span>
          <span
            style={{
              font: '600 22px var(--font-ui)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Köln · Von Zehn<span style={{ color: 'var(--signal-orange)' }}>X</span>
          </span>
        </div>
      </div>

      {guides && (
        <>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: SAFE_W,
              height: SAFE_H,
              border: '2px dashed rgba(255,43,43,0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 2560,
              height: 423,
              border: '2px dashed rgba(245,123,31,0.5)',
            }}
          />
        </>
      )}
    </Stage>
  )
}
