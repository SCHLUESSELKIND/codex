import type { CSSProperties } from 'react'

/*
  Wortmarke der Rubrik: fAILs

  Der Witz steckt im Wort, deshalb muss ihn die Typografie tragen, nicht ein
  Zusatz daneben. Das AI wird hervorgehoben, der Rest bleibt zurückhaltend.
  Wer es einmal gesehen hat, liest ab dann beides gleichzeitig: "fails" und "AI".

  Bewusst kein Emoji, kein Zwinkern, keine Comic-Type. Die Ironie liegt in der
  Sache, nicht in der Verpackung. Genau das hält die Rubrik nach 50 Folgen
  noch aus.
*/

export function FailsMark({
  size = 96,
  style,
  farbe = 'var(--seg-fails)',
}: {
  size?: number
  style?: CSSProperties
  farbe?: string
}) {
  return (
    <span
      className="display"
      style={{
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        // Pflicht: .display schaltet sonst auf Versalien, und aus "fAILs"
        // würde "FAILS". Genau dann ist der Witz weg.
        textTransform: 'none',
        ...style,
      }}
    >
      f<span style={{ color: farbe }}>AI</span>ls
    </span>
  )
}

/** Bewertung von 1 bis 5, als Balkenreihe. Kein Sternchen, keine Emojis. */
export function FailScore({ note, size = 18 }: { note: number; size?: number }) {
  const stufen = [1, 2, 3, 4, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.4 }}>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 800,
          fontSize: size * 0.78,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginRight: size * 0.3,
        }}
      >
        Sinnlosigkeit
      </span>
      {stufen.map((s) => (
        <span
          key={s}
          style={{
            width: size * 0.5,
            height: size * (0.5 + s * 0.18),
            background: s <= note ? 'var(--seg-fails)' : 'transparent',
            border: s <= note ? 'none' : 'var(--line-hair) solid var(--border-subtle)',
          }}
        />
      ))}
    </div>
  )
}
