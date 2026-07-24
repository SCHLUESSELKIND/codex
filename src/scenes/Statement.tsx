import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { useShowState } from '../hooks/useShowState'

/*
  Kernaussagen-Karte: ein Satz, maximale typografische Wucht.

  Der Block ist zwischen Kopfzeile und Metaleiste eingespannt und vertikal
  zentriert, statt bei fester Höhe zu starten. Ein langer Satz wächst dadurch
  nach oben und unten in den freien Raum, statt in die Metaleiste zu laufen.
  Die Schriftgröße staffelt nach Satzlänge, damit auch ein Zitat mit 120
  Zeichen im Bild bleibt.
*/

function schriftgroesse(text: string): number {
  const n = text.trim().length
  if (n <= 30) return 132
  if (n <= 55) return 112
  if (n <= 85) return 88
  if (n <= 120) return 70
  return 56
}

export function Statement() {
  const [state] = useShowState()
  const satz = state.statement || ' '

  return (
    <Stage solid>
      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          right: 'var(--safe-x)',
          top: 200,
          bottom: 190,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className="reveal-up kicker kicker--red" style={{ fontSize: 22 }}>
          Kernaussage
        </div>
        <div
          className="reveal-up reveal-up--d1 display"
          style={{
            fontSize: schriftgroesse(satz),
            marginTop: 'var(--space-12)',
            maxWidth: 1650,
            textWrap: 'balance',
            overflowWrap: 'break-word',
          }}
        >
          {satz}
          <span className="block" style={{ marginLeft: '0.12em' }} />
        </div>
        {state.statementSource && (
          <div className="reveal-up reveal-up--d3 meta" style={{ marginTop: 'var(--space-12)' }}>
            {state.statementSource}
          </div>
        )}
      </div>
      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
