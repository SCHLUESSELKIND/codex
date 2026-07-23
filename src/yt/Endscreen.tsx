import { Stage } from '../components/Stage'
import { WordmarkHorizontal } from '../components/Logo'

/*
  Endscreen · 1920x1080, letzte 20 Sekunden des Videos.
  Die grauen Felder sind exakt die Zonen, in die YouTube die interaktiven
  Elemente legt (2 Videos, 1 Abo-Button). Sie werden im Export dunkel
  ausgespielt, damit die YouTube-Karten sauber darauf sitzen.
  Positionen laut docs/EXPORT_GUIDE.md.
*/

function Slot({
  left,
  top,
  width,
  height,
  label,
  round,
}: {
  left: number
  top: number
  width: number
  height: number
  label: string
  round?: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        borderRadius: round ? '50%' : 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 12,
      }}
    >
      <span className="kicker" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  )
}

export function Endscreen() {
  return (
    <Stage solid>
      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 'var(--safe-y)' }}>
        <WordmarkHorizontal size={34} />
      </div>

      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 190, width: 660 }}>
        <div className="display" style={{ fontSize: 82, lineHeight: 0.94 }}>
          Nächste Woche
          <br />
          wieder live
        </div>
        <div className="hairline" style={{ margin: '36px 0', width: 340 }} />
        <div style={{ display: 'grid', gap: 14 }}>
          <span style={{ font: '800 26px var(--font-ui)' }}>Donnerstag · 19:00 Uhr</span>
          <span style={{ font: '500 22px var(--font-ui)', color: 'var(--text-secondary)' }}>
            Abonnieren und nichts verpassen
          </span>
          <span style={{ font: '500 22px var(--font-ui)', color: 'var(--text-secondary)' }}>
            zehnx.me · tomfrerich.de
          </span>
        </div>
      </div>

      {/* YouTube-Elementzonen */}
      <Slot left={860} top={200} width={480} height={270} label="Video 1" />
      <Slot left={1380} top={200} width={480} height={270} label="Video 2" />
      <Slot left={860} top={560} width={196} height={196} label="Abonnieren" round />

      <div
        style={{
          position: 'absolute',
          left: 1100,
          top: 600,
          width: 620,
        }}
      >
        <span className="kicker kicker--red" style={{ fontSize: 15 }}>
          Weiterbauen
        </span>
        <div style={{ marginTop: 10, font: '500 22px var(--font-ui)', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Alle Folgen, Build-Notizen und die Tools aus der Sendung findest du auf zehnx.me.
        </div>
      </div>
    </Stage>
  )
}
