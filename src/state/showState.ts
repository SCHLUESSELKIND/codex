/*
  Zentraler Sendezustand.

  Format seit Folge 001: 75 Minuten in fünf Segmenten.
    INTRO   ~7 Min   Ankommen, Thema, was heute gebaut wird
    NEWS   ~12 Min   KI-Meldungen mit Praxisfilter (Newsroom-Ansicht)
    fAILS   ~6 Min   ein Werkzeug, das KI falsch einsetzt, sinnlos oder
                     schlicht merkwürdig ist. Recherchiert vor jeder Folge.
    BUILD   45 Min   die Challenge, harte Uhr, gelocktes Ziel
    OUTRO   ~5 Min   Ergebnis, Einordnung, nächste Folge

  Geschrieben wird nur aus der Regie, gelesen von allen Sendeansichten.
  Transport: Server-Relay (SSE) plus BroadcastChannel und localStorage.
*/

export type LowerThirdVariant =
  | 'person'
  | 'gast'
  | 'thema'
  | 'tool'
  | 'quelle'
  | 'definition'
  | 'frage'

export const LOWER_THIRD_KICKER: Record<LowerThirdVariant, string> = {
  person: 'Host',
  gast: 'Zu Gast',
  thema: 'Thema',
  tool: 'Tool',
  quelle: 'Quelle',
  definition: 'Definition',
  frage: 'Zuschauerfrage',
}

/** Die fünf Segmente des 75-Minuten-Formats. */
export type Segment = 'intro' | 'news' | 'fails' | 'build' | 'outro'

export interface SegmentInfo {
  /** Anzeigename im Bild. "fAILs" trägt das AI bewusst im Wort. */
  label: string
  minuten: number
  /** Akzentfarbe des Segments. Rot bleibt der Challenge vorbehalten. */
  farbe: string
  /** Zeile für den Bumper vor dem Segment, im Ton der Show. */
  claim: string
}

export const SEGMENTS: Record<Segment, SegmentInfo> = {
  intro: {
    label: 'Intro',
    minuten: 7,
    farbe: 'var(--seg-intro)',
    claim: 'Was heute gebaut wird',
  },
  news: {
    label: 'News',
    minuten: 12,
    farbe: 'var(--seg-news)',
    claim: 'Sortiert nach dem, was Montag zählt',
  },
  fails: {
    label: 'fAILs',
    minuten: 6,
    farbe: 'var(--seg-fails)',
    claim: 'Jemand hat sich das wirklich getraut',
  },
  build: {
    label: 'Build',
    minuten: 45,
    farbe: 'var(--seg-build)',
    claim: '45 Minuten. Ein Werkzeug. Kein Netz.',
  },
  outro: {
    label: 'Outro',
    minuten: 5,
    farbe: 'var(--seg-outro)',
    claim: 'Was übrig bleibt',
  },
}

export const SEGMENT_ORDER: Segment[] = ['intro', 'news', 'fails', 'build', 'outro']

/** Anzeigename des aktuellen Segments, in Großschreibung fürs Sendebild. */
export function segmentLabel(segment: Segment): string {
  return SEGMENTS[segment]?.label ?? SEGMENTS.intro.label
}

/** Akzentfarbe des aktuellen Segments. */
export function segmentFarbe(segment: Segment): string {
  return SEGMENTS[segment]?.farbe ?? 'var(--text-primary)'
}

export const SENDELAENGE_MIN = 75

/** Der Zustand der Challenge-Uhr. */
export type ChallengeStatus =
  | 'bereit' // Ziel steht, Uhr noch nicht gestartet
  | 'laeuft'
  | 'pause'
  | 'geschafft' // vor Ablauf fertig geworden
  | 'abgelaufen'

/** Ein Kriterium des gelockten Ergebnisses. */
export interface LockKriterium {
  text: string
  erfuellt: boolean
}

export interface ShowState {
  episodeNumber: string
  episodeTitle: string
  segment: Segment
  segmentTitle: string

  presenterName: string
  presenterRole: string
  guestName: string
  guestRole: string

  lowerThirdVariant: LowerThirdVariant
  lowerThirdLine1: string
  lowerThirdLine2: string
  lowerThirdVisible: boolean

  statement: string
  statementSource: string

  // ---- Challenge ----
  /** Was heute gebaut wird, eine Zeile, wird im Bild eingefroren. */
  challengeTitel: string
  /** Die Abnahmekriterien. Zu Beginn gelockt, danach nur noch abhakbar. */
  challengeKriterien: LockKriterium[]
  /** true, sobald das Ziel eingefroren ist. Danach keine Textänderung mehr. */
  challengeGelockt: boolean
  challengeMinuten: number
  challengeStatus: ChallengeStatus
  /** Zeitstempel des letzten Starts, null wenn nie gestartet. */
  challengeStartedAt: number | null
  /** Bereits verbrauchte Sekunden aus früheren Läufen (bei Pause aufaddiert). */
  challengeVerbraucht: number

  // ---- Newsroom ----
  /** Meldungen, eine je Zeile im Format "QUELLE · Schlagzeile" */
  newsItems: string
  /** Index der aktuell besprochenen Meldung, -1 = keine hervorgehoben */
  newsAktiv: number

  // ---- fAILs ----
  /** Name des vorgestellten Werkzeugs. */
  failTitel: string
  /** Was es zu sein behauptet, im Werbesprech des Anbieters. */
  failVersprechen: string
  /** Was es tatsächlich tut, trocken. */
  failRealitaet: string
  /** Quelle, damit die Rubrik nachprüfbar bleibt und nicht zur Behauptung wird. */
  failQuelle: string
  /** Urteil von 1 bis 5. 5 = beeindruckend sinnlos. */
  failNote: number

  // ---- Chat ----
  /** Hervorgehobene Zuschauerfrage im Sendebild. Leer = aus. */
  chatFrage: string
  chatAutor: string
  /** Fensterplatz für die Chat-Quelle in der Challenge-Ansicht freihalten. */
  showChat: boolean

  countdownMinutes: number
  countdownStartedAt: number | null

  isLive: boolean
  standbyTopic: string
  nextShowText: string
  /** Sendeablauf, eine Zeile je Segment im Format "LABEL · Titel" */
  rundown: string

  showLogo: boolean
  showLiveBadge: boolean
  showEpisode: boolean
  showSegment: boolean
  showZehnx: boolean
  showNamePlate: boolean
}

export const DEFAULT_STATE: ShowState = {
  episodeNumber: '001',
  episodeTitle: 'Das Modell ist nicht das Produkt',
  segment: 'intro',
  segmentTitle: 'Was diese Woche wirklich zählt',

  presenterName: 'Thomas Frerich',
  presenterRole: 'Gründer ZehnX · Köln',
  guestName: '',
  guestRole: '',

  lowerThirdVariant: 'thema',
  lowerThirdLine1: 'KI-Agenten im Mittelstand',
  lowerThirdLine2: 'Was heute wirklich in Produktion läuft',
  lowerThirdVisible: true,

  statement: 'Das Modell ist nicht das Produkt.',
  statementSource: 'BUILD ON PURPOSE · Folge 001',

  challengeTitel: 'Ein Tool, das aus einer Rechnung einen Buchungssatz macht',
  challengeKriterien: [
    { text: 'Läuft im Browser, ohne Installation', erfuellt: false },
    { text: 'PDF rein, Buchungssatz raus', erfuellt: false },
    { text: 'Fehlerfall wird sichtbar behandelt', erfuellt: false },
    { text: 'Öffentlich erreichbar am Ende der Sendung', erfuellt: false },
  ],
  challengeGelockt: false,
  challengeMinuten: 45,
  challengeStatus: 'bereit',
  challengeStartedAt: null,
  challengeVerbraucht: 0,

  newsItems: [
    'ANTHROPIC · Neues Modell, und was davon im Alltag zählt',
    'EU · Der AI Act wird konkret, erste Pflichten greifen',
    'OPEN SOURCE · Ein Werkzeug, das diese Woche wirklich Zeit spart',
  ].join('\n'),
  newsAktiv: 0,

  failTitel: 'Der KI-Kühlschrank, der Rezepte diktiert',
  failVersprechen: 'Revolutioniert deine Ernährung mit KI-gestützter Frischeanalyse',
  failRealitaet: 'Erkennt Joghurt als Käse und schlägt dann Käsekuchen vor',
  failQuelle: 'Herstellerseite, abgerufen am 28.07.2026',
  failNote: 4,

  chatFrage: '',
  chatAutor: '',
  showChat: true,

  countdownMinutes: 5,
  countdownStartedAt: null,

  isLive: true,
  standbyTopic: 'Heute: aus einer Rechnung wird ein Buchungssatz. In 45 Minuten.',
  nextShowText: 'Nächste Folge · in zwei Wochen · Donnerstag 19:00 Uhr',
  rundown: [
    'INTRO · Ankommen und Ziel der Sendung',
    'NEWS · Was diese Woche wirklich zählt',
    'fAILs · Der Kühlschrank, der Käsekuchen empfiehlt',
    'BUILD · 45 Minuten, ein Werkzeug, kein Netz',
    'OUTRO · Ergebnis und Einordnung',
  ].join('\n'),

  showLogo: true,
  showLiveBadge: true,
  showEpisode: true,
  showSegment: true,
  showZehnx: true,
  showNamePlate: true,
}

export const STORAGE_KEY = 'bop.show.v2'
export const CHANNEL_NAME = 'bop-show-sync'

export interface RundownItem {
  label: string
  title: string
}

/** "LABEL · Titel" je Zeile → strukturierte Liste. Leere Zeilen fallen raus.
 *  Defensiv: ein alter oder kaputter State darf nie eine Sendegrafik killen. */
export function parseRundown(raw: string | undefined): RundownItem[] {
  if (typeof raw !== 'string') return []
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split('·')
      return { label: label.trim(), title: rest.join('·').trim() }
    })
}

/** Meldungen des Newsrooms, gleiche Schreibweise wie der Ablauf. */
export function parseNews(raw: string | undefined): RundownItem[] {
  return parseRundown(raw)
}

/**
 * Verbleibende Sekunden der Challenge.
 * Die Uhr rechnet aus Startzeitpunkt und bereits verbrauchter Zeit, damit
 * Pausen sauber sind und ein Reload der Browserquelle nichts verfälscht.
 */
export function challengeRest(state: ShowState, jetzt: number): number {
  const gesamt = state.challengeMinuten * 60
  let verbraucht = state.challengeVerbraucht
  if (state.challengeStatus === 'laeuft' && state.challengeStartedAt !== null) {
    verbraucht += Math.floor((jetzt - state.challengeStartedAt) / 1000)
  }
  return Math.max(0, gesamt - verbraucht)
}

export function loadState(): ShowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<ShowState>) }
  } catch {
    return DEFAULT_STATE
  }
}
