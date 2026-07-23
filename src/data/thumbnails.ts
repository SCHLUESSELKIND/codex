// Fünf Thumbnail-Templates. Ein System, fünf klar unterscheidbare Signaturen.
// Unterschieden wird über: Marker-Wort, Akzentlogik und Kompositionsachse,
// NICHT über wechselnde Farbwelten.

export type ThumbTemplate = 'live-build' | 'news' | 'test' | 'talk' | 'signal'

export interface ThumbConfig {
  key: ThumbTemplate
  /** Marker links oben, immer zwei bis drei Wörter */
  marker: string
  /** Marker-Farbe: rot = Aktion/Live, weiß = Analyse, orange NUR beim Sondersignal */
  markerTone: 'red' | 'light' | 'orange'
  /** Beispieltext, 3 bis 6 große Wörter */
  headline: string
  /** Zusatzzeile unter der Headline, optional, klein */
  sub?: string
  /** Komposition: Portrait rechts (default) oder Vollflächen-Typo ohne Portrait */
  layout: 'portrait' | 'typo'
}

export const THUMB_TEMPLATES: Record<ThumbTemplate, ThumbConfig> = {
  'live-build': {
    key: 'live-build',
    marker: 'Live Build',
    markerTone: 'red',
    headline: 'Ich baue den Agenten live',
    sub: 'Von null auf Produktion',
    layout: 'portrait',
  },
  news: {
    key: 'news',
    marker: 'Signal',
    markerTone: 'light',
    headline: 'Was diese Woche wirklich zählt',
    sub: 'KI-News mit Praxisfilter',
    layout: 'portrait',
  },
  test: {
    key: 'test',
    marker: 'Test',
    markerTone: 'light',
    headline: 'Funktioniert das im Mittelstand?',
    sub: 'Modell im Alltagstest',
    layout: 'portrait',
  },
  talk: {
    key: 'talk',
    marker: 'Talk · Q&A',
    markerTone: 'light',
    headline: 'Kein Hype. Ein System.',
    sub: 'Eure Fragen, ehrlich beantwortet',
    layout: 'portrait',
  },
  signal: {
    key: 'signal',
    marker: 'Breaking Signal',
    markerTone: 'orange',
    headline: 'Das Modell ist nicht das Produkt',
    layout: 'typo',
  },
}

// Weitere freigegebene Beispieltexte aus dem Briefing, für schnelle Folgen.
export const HEADLINE_POOL = [
  'Ich baue den Agenten live',
  'Diese KI ändert den Workflow',
  'Was diese Woche wirklich zählt',
  'Funktioniert das im Mittelstand?',
  'Kein Hype. Ein System.',
  'Der Build ist gescheitert',
  'KI-Agent in 30 Minuten',
  'Das Modell ist nicht das Produkt',
]
