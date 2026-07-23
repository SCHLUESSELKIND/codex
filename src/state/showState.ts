// Zentraler Sendezustand. Wird vom Control Panel geschrieben und von allen
// OBS-Views gelesen. Sync: localStorage (Persistenz) + BroadcastChannel (live).

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

export interface ShowState {
  episodeNumber: string
  episodeTitle: string
  segmentLabel: string
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

  buildGoal: string
  buildStep: number
  buildStepTotal: number

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
  segmentLabel: 'SIGNAL 01',
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

  buildGoal: 'E-Mail-Triage-Agent mit Eval-Gate',
  buildStep: 2,
  buildStepTotal: 5,

  countdownMinutes: 5,
  countdownStartedAt: null,

  isLive: true,
  standbyTopic: 'Heute: KI-Agenten, die den Posteingang wirklich sortieren',
  nextShowText: 'Nächste Folge · Donnerstag · 19:00 Uhr',
  rundown: [
    'SIGNAL 01 · Was diese Woche wirklich zählt',
    'BUILD 02 · Triage-Agent mit Eval-Gate',
    'TEST 03 · Läuft das im Mittelstand?',
    'Q&A 04 · Eure Fragen',
  ].join('\n'),

  showLogo: true,
  showLiveBadge: true,
  showEpisode: true,
  showSegment: true,
  showZehnx: true,
  showNamePlate: true,
}

export const STORAGE_KEY = 'bop.show.v1'
export const CHANNEL_NAME = 'bop-show-sync'

export interface RundownItem {
  label: string
  title: string
}

/** "SIGNAL 01 · Titel" je Zeile → strukturierte Liste. Leere Zeilen fallen raus.
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

export function loadState(): ShowState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<ShowState>) }
  } catch {
    return DEFAULT_STATE
  }
}
