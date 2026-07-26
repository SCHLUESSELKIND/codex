import { Stage } from '../components/Stage'
import { MetaRail } from '../components/MetaRail'
import { LiveBadge, WordmarkHorizontal } from '../components/Logo'
import { FailsMark, FailScore } from '../components/FailsMark'
import { useShowState } from '../hooks/useShowState'

/*
  Die Rubrik fAILs.

  Dramaturgie der Karte: erst das Versprechen des Anbieters, dann die Realität.
  Der Witz entsteht aus dem Abstand zwischen beiden, nicht aus einer Pointe,
  die wir dazuschreiben. Deshalb stehen beide Blöcke gleich groß untereinander,
  getrennt von einer Linie, und die Realität sitzt in der stärkeren Farbe.

  Die Quellenzeile ist Pflicht, nicht Deko. Eine Spott-Rubrik ohne Beleg wird
  zur Behauptung, und das hält keine 50 Folgen.
*/

export function Fails() {
  const [state] = useShowState()

  return (
    <Stage solid>
      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          top: 'var(--safe-y)',
          right: 'var(--safe-x)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {state.showLogo && <WordmarkHorizontal size={22} />}
        <div style={{ flex: 1 }} />
        {state.showLiveBadge && <LiveBadge size={13} live={state.isLive} />}
      </div>

      <div style={{ position: 'absolute', left: 'var(--safe-x)', top: 170, right: 'var(--safe-x)' }}>
        <div className="reveal-up">
          <FailsMark size={104} />
        </div>

        <div
          className="reveal-up reveal-up--d1"
          style={{
            marginTop: 'var(--space-8)',
            font: '800 46px var(--font-ui)',
            lineHeight: 1.15,
            maxWidth: 1500,
          }}
        >
          {state.failTitel}
        </div>

        <div
          className="reveal-up reveal-up--d2"
          style={{ marginTop: 'var(--space-12)', display: 'grid', gap: 'var(--space-6)', maxWidth: 1560 }}
        >
          <div>
            <div className="kicker" style={{ marginBottom: 'var(--space-2)' }}>
              Verspricht
            </div>
            <div
              style={{
                font: '500 30px var(--font-ui)',
                lineHeight: 1.32,
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}
            >
              „{state.failVersprechen}“
            </div>
          </div>

          <div className="hairline" style={{ width: 340 }} />

          <div>
            <div
              className="kicker"
              style={{ color: 'var(--seg-fails)', marginBottom: 'var(--space-2)' }}
            >
              Tut tatsächlich
            </div>
            <div style={{ font: '800 36px var(--font-ui)', lineHeight: 1.24, color: 'var(--text-primary)' }}>
              {state.failRealitaet}
            </div>
          </div>
        </div>

        <div
          className="reveal-up reveal-up--d3"
          style={{
            marginTop: 'var(--space-16)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-12)',
          }}
        >
          <FailScore note={state.failNote} size={22} />
          {state.failQuelle && <span className="meta">Quelle: {state.failQuelle}</span>}
        </div>
      </div>

      <MetaRail episodeNumber={state.episodeNumber} showZehnx={state.showZehnx} />
    </Stage>
  )
}
