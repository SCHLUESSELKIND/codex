import { Stage } from '../components/Stage'

/*
  Profilbild · 800x800, wird von YouTube rund beschnitten.
  Nur das Monogramm B + Baustein. Kein Text, keine Zusatzzeile.
  Der Baustein sitzt bewusst auf der Grundlinie rechts, damit die
  Silhouette auch bei 24px noch als "B mit Marker" lesbar bleibt.
*/

export function Avatar() {
  return (
    <Stage width={800} height={800} solid>
      {/* Kreis-Hilfslinie (wird vom YouTube-Crop übernommen) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'var(--bg-primary)',
          border: '1px solid rgba(244,244,241,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <span className="display" style={{ fontSize: 400, lineHeight: 0.8 }}>
          B
        </span>
        <span
          style={{
            width: 84,
            height: 116,
            background: 'var(--live-red)',
            alignSelf: 'flex-end',
            marginBottom: 152,
          }}
        />
      </div>
    </Stage>
  )
}
