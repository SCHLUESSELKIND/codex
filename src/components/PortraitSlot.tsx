import { useState } from 'react'

/*
  Austauschbares Bildmodul. Lädt public/portraits/<name>.png, wenn vorhanden.
  Fehlt die Datei, erscheint ein klar markierter Platzhalter, kein erfundenes
  Gesicht, kein Stockbild. Bildbehandlung laut docs/DESIGN_SYSTEM.md:
  Freisteller auf Dunkel, Kantenlicht von links, dezente Körnung.
*/

export function PortraitSlot({
  src = 'portraits/tom-01.png',
  width,
  height,
  style,
}: {
  src?: string
  width: number | string
  height: number | string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)

  if (!failed) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        style={{
          width,
          height,
          objectFit: 'cover',
          objectPosition: 'top center',
          display: 'block',
          ...style,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width,
        height,
        background: 'var(--surface)',
        border: '1px dashed var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        ...style,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: '2px solid var(--text-muted)',
          borderRadius: '50%',
        }}
      />
      <span className="kicker" style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
        Portrait-Slot
        <br />
        public/{src}
      </span>
    </div>
  )
}
