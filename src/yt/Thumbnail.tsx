import { useParams, useSearchParams } from 'react-router-dom'
import { Stage } from '../components/Stage'
import { PortraitSlot } from '../components/PortraitSlot'
import { THUMB_TEMPLATES, type ThumbTemplate } from '../data/thumbnails'

/*
  Thumbnail-System · 1280x720.
  Regeln (siehe docs/THUMBNAIL_GUIDE.md):
  - maximal 6 große Wörter, Headline immer Archivo Black
  - genau EIN primäres Motiv (Portrait ODER Typo, nie beides gleich laut)
  - Marker links oben trägt die Sortenlogik der Folge
  - rechte Bildhälfte = Portraitzone, linke = Textzone (Silhouette!)

  Override per Query: ?headline=...&marker=...&sub=...&episode=012
*/

const TONE: Record<string, string> = {
  red: 'var(--live-red)',
  light: 'var(--text-primary)',
  orange: 'var(--signal-orange)',
}

export function Thumbnail() {
  const { template } = useParams<{ template: string }>()
  const [params] = useSearchParams()

  const key = (template ?? 'live-build') as ThumbTemplate
  const config = THUMB_TEMPLATES[key] ?? THUMB_TEMPLATES['live-build']

  const headline = params.get('headline') ?? config.headline
  const marker = params.get('marker') ?? config.marker
  const sub = params.get('sub') ?? config.sub
  const episode = params.get('episode') ?? '001'
  const tone = TONE[config.markerTone]

  const isTypo = config.layout === 'typo'
  // 44 px Luft zur Portraitzone (beginnt bei x=760), damit die Headline
  // auch bei einem echten Freisteller nie an der Schulter klebt.
  const textWidth = isTypo ? 1120 : 660

  // Schriftgröße nach Textlänge staffeln: maximal drei Zeilen, sonst
  // bricht die Lesbarkeit in der YouTube-Seitenleiste weg.
  const len = headline.length
  const headlineSize = isTypo
    ? len > 34
      ? 108
      : 132
    : len > 30
      ? 78
      : len > 20
        ? 88
        : 104

  return (
    <Stage width={1280} height={720} solid>
      {/* Feines technisches Raster, nur als Textur, nie als Dekoration */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(244,244,241,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(244,244,241,0.055) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(90deg, rgba(0,0,0,0.9), transparent 70%)',
        }}
      />

      {/* Portraitzone rechts */}
      {!isTypo && (
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 520 }}>
          <PortraitSlot src="portraits/tom-thumb.png" width={520} height={720} />
          {/* Abdunkler zur Textzone: hält die Headline auch bei hellem Portrait
              lesbar. Keine harte Trennkante, damit Freisteller frei stehen. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(6,6,6,0.92) 0%, rgba(6,6,6,0) 38%)',
            }}
          />
        </div>
      )}

      {/* Marker links oben */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ width: 18, height: 22, background: tone, display: 'block' }} />
        <span
          style={{
            font: '900 26px var(--font-ui)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: tone,
          }}
        >
          {marker}
        </span>
      </div>

      {/* Headline */}
      {/* Textblock optisch mittig zwischen Marker und Fußzeile: kurze Headlines
          kleben dadurch nicht oben, lange laufen nach unten aus. */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 130,
          bottom: 130,
          width: textWidth,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h1
          className="display"
          style={{
            fontSize: headlineSize,
            lineHeight: 0.94,
            textWrap: 'balance',
          }}
        >
          {headline}
        </h1>
        {sub && (
          <p
            style={{
              marginTop: 26,
              font: '700 30px var(--font-ui)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
            }}
          >
            {sub}
          </p>
        )}
      </div>

      {/* Fußleiste: Marke + Episode. Klein, aber immer da (Wiedererkennung im Feed) */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          bottom: 46,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span className="display" style={{ fontSize: 30 }}>
          BUILD<span className="block" style={{ marginLeft: 5 }} />
        </span>
        <span
          style={{
            font: '800 20px var(--font-ui)',
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}
        >
          On Purpose
        </span>
        <span
          style={{
            font: '700 20px var(--font-ui)',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          #{episode}
        </span>
      </div>
    </Stage>
  )
}
