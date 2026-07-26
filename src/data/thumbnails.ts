/*
  Thumbnail-System.

  Ein System, sechs Sorten. Unterschieden wird über Marker-Wort, Akzentfarbe
  und Kompositionsachse, NICHT über wechselnde Farbwelten.

  Ton: trocken, selbstironisch, informativ. Der Witz liegt in der Sache,
  nie in Ausrufezeichen oder Großbuchstaben-Geschrei. Eine Zeile darf weh tun
  oder grinsen, aber sie muss stimmen. Kein Clickbait, der die Folge nicht hält.
*/

export type ThumbTemplate = 'challenge' | 'news' | 'fails' | 'test' | 'talk' | 'signal'

export interface ThumbConfig {
  key: ThumbTemplate
  /** Marker links oben, immer zwei bis drei Wörter */
  marker: string
  /** Marker-Farbe: rot = Challenge, gelb = fAILs, weiß = Analyse, orange = Sondersignal */
  markerTone: 'red' | 'light' | 'orange' | 'yellow'
  /** Beispieltext, 3 bis 6 große Wörter */
  headline: string
  /** Zusatzzeile unter der Headline, optional, klein */
  sub?: string
  /** Komposition: Portrait rechts (default) oder Vollflächen-Typo ohne Portrait */
  layout: 'portrait' | 'typo'
  /** Zeitplakette oben rechts, nur bei der Challenge */
  zeit?: string
}

export const THUMB_TEMPLATES: Record<ThumbTemplate, ThumbConfig> = {
  challenge: {
    key: 'challenge',
    marker: 'Die Challenge',
    markerTone: 'red',
    headline: 'Ein Tool in 45 Minuten',
    sub: 'Von null, live, ohne Netz',
    layout: 'portrait',
    zeit: '45:00',
  },
  news: {
    key: 'news',
    marker: 'News',
    markerTone: 'light',
    headline: 'Was diese Woche wirklich zählt',
    sub: 'KI-Nachrichten mit Praxisfilter',
    layout: 'portrait',
  },
  fails: {
    key: 'fails',
    marker: 'fAILs',
    markerTone: 'yellow',
    headline: 'Jemand hat das wirklich gebaut',
    sub: 'Die Rubrik für teure Missverständnisse',
    layout: 'portrait',
  },
  test: {
    key: 'test',
    marker: 'Test',
    markerTone: 'light',
    headline: 'Funktioniert das im Mittelstand?',
    sub: 'Ein Modell im Alltagstest',
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

/*
  Freigegebene Beispieltexte. Die scheiternden sind Absicht: eine Sendung, die
  auch das Misslingen zeigt, ist glaubwürdiger als eine, in der immer alles klappt.
*/
export const HEADLINE_POOL = [
  'Ein Tool in 45 Minuten',
  'Ich habe es nicht geschafft',
  'Diese KI ändert den Workflow',
  'Was diese Woche wirklich zählt',
  'Funktioniert das im Mittelstand?',
  'Kein Hype. Ein System.',
  'Der Build ist gescheitert',
  'Jemand hat das wirklich gebaut',
  'Das Modell ist nicht das Produkt',
  '45 Minuten, und dann?',
]
