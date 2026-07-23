import { useParams, useSearchParams } from 'react-router-dom'
import { Stage } from '../components/Stage'
import { WordmarkStacked } from '../components/Logo'

/*
  Community- und Social-Vorlagen.
  Formate: /social/square (1080x1080) · /social/portrait (1080x1350) · /social/story (1080x1920)
  Anlass:  ?type=neue-folge | heute-live | kernaussage | termin | build-ergebnis | zitat | frage
  Texte:   ?headline=... &sub=... &episode=012
*/

const FORMATS: Record<string, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
  story: { w: 1080, h: 1920 },
}

interface Preset {
  marker: string
  tone: 'red' | 'light' | 'orange'
  headline: string
  sub: string
}

const PRESETS: Record<string, Preset> = {
  'neue-folge': {
    marker: 'Neue Folge',
    tone: 'light',
    headline: 'KI-Agent in 30 Minuten',
    sub: 'Folge 001 · jetzt auf YouTube',
  },
  'heute-live': {
    marker: 'Heute live',
    tone: 'red',
    headline: '19:00 Uhr',
    sub: 'Wir bauen den Triage-Agenten. Fragen willkommen.',
  },
  kernaussage: {
    marker: 'Kernaussage',
    tone: 'light',
    headline: 'Das Modell ist nicht das Produkt.',
    sub: 'Aus Folge 001',
  },
  termin: {
    marker: 'Termin',
    tone: 'light',
    headline: 'Donnerstag 19:00',
    sub: 'Jede Woche live aus Köln',
  },
  'build-ergebnis': {
    marker: 'Build-Ergebnis',
    tone: 'red',
    headline: 'Läuft in Produktion',
    sub: 'Triage-Agent, 5 Schritte, ein Eval-Gate davor',
  },
  zitat: {
    marker: 'Zitat',
    tone: 'light',
    headline: 'Automatisierung ohne Verantwortung ist nur schnelleres Chaos.',
    sub: 'Thomas Frerich',
  },
  frage: {
    marker: 'Eure Entscheidung',
    tone: 'orange',
    headline: 'Was soll ich als Nächstes bauen?',
    sub: 'Antwort in die Kommentare, der Vorschlag mit den meisten Stimmen kommt live dran',
  },
}

const TONE: Record<string, string> = {
  red: 'var(--live-red)',
  light: 'var(--text-primary)',
  orange: 'var(--signal-orange)',
}

export function Social() {
  const { format } = useParams<{ format: string }>()
  const [params] = useSearchParams()

  const dim = FORMATS[format ?? 'square'] ?? FORMATS.square
  const preset = PRESETS[params.get('type') ?? 'neue-folge'] ?? PRESETS['neue-folge']

  const headline = params.get('headline') ?? preset.headline
  const sub = params.get('sub') ?? preset.sub
  const marker = params.get('marker') ?? preset.marker
  const episode = params.get('episode') ?? '001'

  const pad = 88
  const long = dim.h >= 1350
  const headlineSize = headline.length > 46 ? (long ? 76 : 64) : long ? 104 : 88

  return (
    <Stage width={dim.w} height={dim.h} solid>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(244,244,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,244,241,0.05) 1px, transparent 1px)',
          backgroundSize: '108px 108px',
          maskImage: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))',
        }}
      />

      {/* Marker oben */}
      <div style={{ position: 'absolute', left: pad, top: pad, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 16, height: 20, background: TONE[preset.tone] }} />
        <span
          style={{
            font: '900 24px var(--font-ui)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: TONE[preset.tone],
          }}
        >
          {marker}
        </span>
      </div>

      {/* Headline-Block, optisch auf der unteren Drittellinie verankert */}
      <div style={{ position: 'absolute', left: pad, right: pad, bottom: pad + 190 }}>
        <h1 className="display" style={{ fontSize: headlineSize, lineHeight: 0.95, textWrap: 'balance' }}>
          {headline}
        </h1>
        <div className="hairline" style={{ margin: '40px 0 28px', width: 260 }} />
        <p style={{ font: '600 28px var(--font-ui)', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{sub}</p>
      </div>

      {/* Fußzeile: Marke + Episode */}
      <div
        style={{
          position: 'absolute',
          left: pad,
          right: pad,
          bottom: pad,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <WordmarkStacked size={54} />
        <span
          style={{
            font: '700 20px var(--font-ui)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          #{episode} · @tom_frerich
        </span>
      </div>
    </Stage>
  )
}
