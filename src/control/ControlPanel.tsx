import { useState, type CSSProperties, type ReactNode } from 'react'
import { useShowState, useRegieSync } from '../hooks/useShowState'
import { ChallengeClock } from '../components/ChallengeClock'
import {
  LOWER_THIRD_KICKER,
  SEGMENTS,
  SEGMENT_ORDER,
  type LowerThirdVariant,
  type ShowState,
} from '../state/showState'

/*
  Regie-Panel.

  Bedienregel: Was während der Sendung gebraucht wird, liegt oben und ist
  groß genug für einen hektischen Klick. Was vor der Sendung eingerichtet wird,
  liegt unten. Nichts Wichtiges versteckt sich hinter einem Aufklapper.
*/

const field: CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-ui)',
  color: 'var(--text-primary)',
  font: '500 14px var(--font-ui)',
  padding: '8px 10px',
}

const labelStyle: CSSProperties = {
  display: 'block',
  font: '700 var(--type-label) var(--font-ui)',
  letterSpacing: 'var(--tracking-wide)',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  margin: '12px 0 4px',
}

const knopf: CSSProperties = {
  font: '800 13px var(--font-ui)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '10px 14px',
  borderRadius: 'var(--radius-ui)',
  border: '1px solid var(--border-subtle)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  )
}

function Text({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <Field label={label}>
      <input
        style={{ ...field, opacity: disabled ? 0.45 : 1 }}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <Field label={label}>
      <textarea
        style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

/*
  Zahlenfeld mit lokalem Zwischenstand: ein direkt geklemmtes Feld macht das
  Leeren unmöglich, aus "" würde sofort "1" und aus 15 dann 115.
*/
function NumberInput({
  value,
  min,
  max,
  onCommit,
}: {
  value: number
  min: number
  max: number
  onCommit: (v: number) => void
}) {
  const [roh, setRoh] = useState<string | null>(null)
  const angezeigt = roh ?? String(value)

  const klemmen = (text: string) => {
    const zahl = Number(text)
    if (text.trim() === '' || Number.isNaN(zahl)) return value
    return Math.min(max, Math.max(min, Math.round(zahl)))
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      style={field}
      value={angezeigt}
      onChange={(e) => {
        setRoh(e.target.value)
        const zahl = Number(e.target.value)
        if (e.target.value.trim() !== '' && !Number.isNaN(zahl) && zahl >= min && zahl <= max) {
          onCommit(Math.round(zahl))
        }
      }}
      onBlur={(e) => {
        onCommit(klemmen(e.target.value))
        setRoh(null)
      }}
    />
  )
}

function Toggle({
  label,
  value,
  onChange,
  accent,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  accent?: boolean
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        ...knopf,
        background: value ? (accent ? 'var(--live-red)' : 'var(--surface)') : 'transparent',
        color: value ? (accent ? '#0a0202' : 'var(--text-primary)') : 'var(--text-muted)',
      }}
    >
      {label}: {value ? 'AN' : 'AUS'}
    </button>
  )
}

function Section({
  title,
  children,
  akzent,
}: {
  title: string
  children: ReactNode
  akzent?: string
}) {
  return (
    <section
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        borderTop: `3px solid ${akzent ?? 'var(--border-strong)'}`,
        padding: 16,
      }}
    >
      <h2 style={{ font: '400 18px var(--font-display)', textTransform: 'uppercase', marginBottom: 4 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

const VIEWS = [
  'standby',
  'camera',
  'newsroom',
  'fails',
  'build',
  'challenge',
  'screen',
  'topic',
  'lower-third',
  'statement',
  'break',
  'end',
  'technical',
]

export function ControlPanel() {
  const [state, update, reset] = useShowState()
  useRegieSync(state, update)

  const set = (key: keyof ShowState) => (v: string) => update({ [key]: v } as Partial<ShowState>)

  // ---- Challenge-Uhr ----
  const start = () =>
    update({
      challengeStatus: 'laeuft',
      challengeStartedAt: Date.now(),
      challengeGelockt: true,
    })

  const pause = () => {
    if (state.challengeStatus !== 'laeuft' || state.challengeStartedAt === null) return
    const dazu = Math.floor((Date.now() - state.challengeStartedAt) / 1000)
    update({
      challengeStatus: 'pause',
      challengeVerbraucht: state.challengeVerbraucht + dazu,
      challengeStartedAt: null,
    })
  }

  const weiter = () => update({ challengeStatus: 'laeuft', challengeStartedAt: Date.now() })

  const geschafft = () => {
    const dazu =
      state.challengeStatus === 'laeuft' && state.challengeStartedAt !== null
        ? Math.floor((Date.now() - state.challengeStartedAt) / 1000)
        : 0
    update({
      challengeStatus: 'geschafft',
      challengeVerbraucht: state.challengeVerbraucht + dazu,
      challengeStartedAt: null,
    })
  }

  const uhrZuruecksetzen = () => {
    if (!window.confirm('Uhr komplett zurücksetzen? Die verbrauchte Zeit geht verloren.')) return
    update({ challengeStatus: 'bereit', challengeStartedAt: null, challengeVerbraucht: 0 })
  }

  const kriteriumSetzen = (index: number, patch: Partial<{ text: string; erfuellt: boolean }>) => {
    const naechste = state.challengeKriterien.map((k, i) => (i === index ? { ...k, ...patch } : k))
    update({ challengeKriterien: naechste })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        padding: 24,
        overflow: 'auto',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <span className="display" style={{ fontSize: 28 }}>
          BUILD<span className="block" style={{ marginLeft: 4 }} />
        </span>
        <span style={{ ...labelStyle, margin: 0 }}>Regie</span>
        <div style={{ flex: 1 }} />
        <Toggle label="Live" value={state.isLive} onChange={(v) => update({ isLive: v })} accent />
        <button
          onClick={() => {
            if (
              window.confirm(
                'Alle Eingaben auf die Beispielinhalte zurücksetzen?\n\nDas wirkt sofort im Sendebild.',
              )
            )
              reset()
          }}
          style={{ ...knopf, background: 'transparent', color: 'var(--text-secondary)' }}
        >
          Zurücksetzen
        </button>
      </header>

      {/* ---- Segmentwahl: der wichtigste Schalter der Sendung ---- */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {SEGMENT_ORDER.map((s) => {
          const aktiv = state.segment === s
          return (
            <button
              key={s}
              onClick={() => update({ segment: s })}
              style={{
                ...knopf,
                padding: '14px 22px',
                fontSize: 15,
                background: aktiv ? SEGMENTS[s].farbe : 'transparent',
                color: aktiv ? '#0a0202' : 'var(--text-secondary)',
                borderColor: aktiv ? SEGMENTS[s].farbe : 'var(--border-subtle)',
              }}
            >
              {SEGMENTS[s].label}
              <span style={{ opacity: 0.6, marginLeft: 8, fontWeight: 600 }}>
                {SEGMENTS[s].minuten} Min
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {/* ---- Challenge, das Herz der Sendung ---- */}
        <Section title="Challenge" akzent="var(--live-red)">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
            <ChallengeClock state={state} size={132} />
            <div style={{ display: 'grid', gap: 8, flex: 1 }}>
              {state.challengeStatus === 'bereit' && (
                <button
                  onClick={start}
                  style={{ ...knopf, background: 'var(--live-red)', color: '#0a0202', padding: '14px' }}
                >
                  Ziel locken und starten
                </button>
              )}
              {state.challengeStatus === 'laeuft' && (
                <button onClick={pause} style={{ ...knopf, padding: '14px' }}>
                  Anhalten
                </button>
              )}
              {state.challengeStatus === 'pause' && (
                <button
                  onClick={weiter}
                  style={{ ...knopf, background: 'var(--live-red)', color: '#0a0202', padding: '14px' }}
                >
                  Weiter
                </button>
              )}
              {(state.challengeStatus === 'laeuft' || state.challengeStatus === 'pause') && (
                <button
                  onClick={geschafft}
                  style={{ ...knopf, background: 'var(--success)', color: '#04160c', padding: '14px' }}
                >
                  Geschafft
                </button>
              )}
              <button onClick={uhrZuruecksetzen} style={{ ...knopf, background: 'transparent' }}>
                Uhr zurücksetzen
              </button>
            </div>
          </div>

          <Text
            label={state.challengeGelockt ? 'Ziel (gelockt, nicht mehr änderbar)' : 'Ziel der Challenge'}
            value={state.challengeTitel}
            onChange={set('challengeTitel')}
            disabled={state.challengeGelockt}
          />
          <Field label="Dauer in Minuten">
            <NumberInput
              value={state.challengeMinuten}
              min={5}
              max={90}
              onCommit={(v) => update({ challengeMinuten: v })}
            />
          </Field>

          <span style={labelStyle}>Fertig ist es, wenn</span>
          <div style={{ display: 'grid', gap: 6 }}>
            {state.challengeKriterien.map((k, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => kriteriumSetzen(i, { erfuellt: !k.erfuellt })}
                  title="Abhaken"
                  style={{
                    ...knopf,
                    padding: '9px 12px',
                    flex: 'none',
                    background: k.erfuellt ? 'var(--success)' : 'transparent',
                    color: k.erfuellt ? '#04160c' : 'var(--text-muted)',
                  }}
                >
                  {k.erfuellt ? 'OK' : '–'}
                </button>
                <input
                  style={{ ...field, opacity: state.challengeGelockt ? 0.55 : 1 }}
                  value={k.text}
                  disabled={state.challengeGelockt}
                  onChange={(e) => kriteriumSetzen(i, { text: e.target.value })}
                />
              </div>
            ))}
          </div>
          {!state.challengeGelockt && state.challengeKriterien.length < 5 && (
            <button
              style={{ ...knopf, marginTop: 8, background: 'transparent' }}
              onClick={() =>
                update({
                  challengeKriterien: [...state.challengeKriterien, { text: '', erfuellt: false }],
                })
              }
            >
              Kriterium hinzufügen
            </button>
          )}
          {state.challengeGelockt && (
            <button
              style={{ ...knopf, marginTop: 8, background: 'transparent', color: 'var(--warning)' }}
              onClick={() => {
                if (window.confirm('Ziel wieder entsperren? Im Sendebild verschwindet der Lock-Hinweis.'))
                  update({ challengeGelockt: false })
              }}
            >
              Ziel entsperren
            </button>
          )}
        </Section>

        {/* ---- Newsroom ---- */}
        <Section title="Newsroom" akzent="var(--signal-orange)">
          <Area
            label="Meldungen, je Zeile: QUELLE · Schlagzeile"
            value={state.newsItems}
            onChange={set('newsItems')}
            rows={6}
          />
          <span style={labelStyle}>Aktuell besprochen</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => update({ newsAktiv: -1 })}
              style={{
                ...knopf,
                background: state.newsAktiv < 0 ? 'var(--surface)' : 'transparent',
                color: state.newsAktiv < 0 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              keine
            </button>
            {state.newsItems
              .split('\n')
              .filter((z) => z.trim())
              .slice(0, 6)
              .map((_, i) => (
                <button
                  key={i}
                  onClick={() => update({ newsAktiv: i })}
                  style={{
                    ...knopf,
                    background: state.newsAktiv === i ? 'var(--signal-orange)' : 'transparent',
                    color: state.newsAktiv === i ? '#150a02' : 'var(--text-muted)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
          </div>
        </Section>

        {/* ---- fAILs ---- */}
        <Section title="fAILs" akzent="var(--seg-fails)">
          <Text label="Name des Werkzeugs" value={state.failTitel} onChange={set('failTitel')} />
          <Text label="Verspricht" value={state.failVersprechen} onChange={set('failVersprechen')} />
          <Text label="Tut tatsächlich" value={state.failRealitaet} onChange={set('failRealitaet')} />
          <Text label="Quelle (Pflicht)" value={state.failQuelle} onChange={set('failQuelle')} />
          <span style={labelStyle}>Sinnlosigkeit</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => update({ failNote: n })}
                style={{
                  ...knopf,
                  background: state.failNote === n ? 'var(--seg-fails)' : 'transparent',
                  color: state.failNote === n ? '#150a02' : 'var(--text-muted)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </Section>

        {/* ---- Chat ---- */}
        <Section title="Chat" akzent="var(--signal-orange)">
          <Text label="Frage im Bild" value={state.chatFrage} onChange={set('chatFrage')} />
          <Text label="Von" value={state.chatAutor} onChange={set('chatAutor')} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              style={{ ...knopf, background: 'transparent' }}
              onClick={() => update({ chatFrage: '', chatAutor: '' })}
            >
              Frage ausblenden
            </button>
            <Toggle
              label="Chatfenster"
              value={state.showChat}
              onChange={(v) => update({ showChat: v })}
            />
          </div>
        </Section>

        {/* ---- Bauchbinde ---- */}
        <Section title="Bauchbinde">
          <Field label="Variante">
            <select
              style={field}
              value={state.lowerThirdVariant}
              onChange={(e) => update({ lowerThirdVariant: e.target.value as LowerThirdVariant })}
            >
              {(Object.keys(LOWER_THIRD_KICKER) as LowerThirdVariant[]).map((v) => (
                <option key={v} value={v}>
                  {LOWER_THIRD_KICKER[v]}
                </option>
              ))}
            </select>
          </Field>
          <Text label="Zeile 1" value={state.lowerThirdLine1} onChange={set('lowerThirdLine1')} />
          <Text label="Zeile 2" value={state.lowerThirdLine2} onChange={set('lowerThirdLine2')} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Toggle
              label="Einblenden"
              value={state.lowerThirdVisible}
              onChange={(v) => update({ lowerThirdVisible: v })}
              accent
            />
            <button
              style={knopf}
              onClick={() =>
                update({
                  lowerThirdVariant: 'person',
                  lowerThirdLine1: state.presenterName,
                  lowerThirdLine2: state.presenterRole,
                  lowerThirdVisible: true,
                })
              }
            >
              Host
            </button>
            <button
              disabled={!state.guestName.trim()}
              title={state.guestName.trim() ? undefined : 'Erst einen Gastnamen eintragen'}
              style={{
                ...knopf,
                cursor: state.guestName.trim() ? 'pointer' : 'not-allowed',
                opacity: state.guestName.trim() ? 1 : 0.4,
              }}
              onClick={() =>
                update({
                  lowerThirdVariant: 'gast',
                  lowerThirdLine1: state.guestName,
                  lowerThirdLine2: state.guestRole,
                  lowerThirdVisible: true,
                })
              }
            >
              Gast
            </button>
          </div>
        </Section>

        {/* ---- Sendung, Einrichtung vor der Show ---- */}
        <Section title="Sendung">
          <Text label="Episodennummer" value={state.episodeNumber} onChange={set('episodeNumber')} />
          <Text label="Episodentitel" value={state.episodeTitle} onChange={set('episodeTitle')} />
          <Text label="Segmenttitel" value={state.segmentTitle} onChange={set('segmentTitle')} />
          <Text label="Standby-Thema" value={state.standbyTopic} onChange={set('standbyTopic')} />
          <Text label="Nächste Folge" value={state.nextShowText} onChange={set('nextShowText')} />
          <Area label="Ablauf, je Zeile: LABEL · Titel" value={state.rundown} onChange={set('rundown')} rows={5} />
        </Section>

        <Section title="Personen">
          <Text label="Name" value={state.presenterName} onChange={set('presenterName')} />
          <Text label="Rolle" value={state.presenterRole} onChange={set('presenterRole')} />
          <Text label="Gast" value={state.guestName} onChange={set('guestName')} />
          <Text label="Gast-Rolle" value={state.guestRole} onChange={set('guestRole')} />
        </Section>

        <Section title="Kernaussage">
          <Text label="Aussage" value={state.statement} onChange={set('statement')} />
          <Text label="Quelle" value={state.statementSource} onChange={set('statementSource')} />
        </Section>

        <Section title="Standby-Countdown">
          <Field label="Minuten">
            <NumberInput
              value={state.countdownMinutes}
              min={1}
              max={60}
              onCommit={(v) => update({ countdownMinutes: v })}
            />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              style={{ ...knopf, borderColor: 'var(--live-red)' }}
              onClick={() => update({ countdownStartedAt: Date.now() })}
            >
              Start
            </button>
            <button style={knopf} onClick={() => update({ countdownStartedAt: null })}>
              Stopp
            </button>
          </div>
        </Section>

        <Section title="Sichtbarkeit">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <Toggle label="Logo" value={state.showLogo} onChange={(v) => update({ showLogo: v })} />
            <Toggle label="LIVE" value={state.showLiveBadge} onChange={(v) => update({ showLiveBadge: v })} />
            <Toggle label="Episode" value={state.showEpisode} onChange={(v) => update({ showEpisode: v })} />
            <Toggle label="Segment" value={state.showSegment} onChange={(v) => update({ showSegment: v })} />
            <Toggle label="Nameplate" value={state.showNamePlate} onChange={(v) => update({ showNamePlate: v })} />
            <Toggle label="ZehnX" value={state.showZehnx} onChange={(v) => update({ showZehnx: v })} />
          </div>
        </Section>

        <Section title="Ansichten">
          <div style={{ display: 'grid', gap: 5, marginTop: 8 }}>
            {VIEWS.map((v) => (
              <a
                key={v}
                href={`#/${v}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary)', font: '600 14px var(--font-ui)', textDecoration: 'none' }}
              >
                → /{v}
              </a>
            ))}
            {SEGMENT_ORDER.map((s) => (
              <a
                key={s}
                href={`#/bumper/${s}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-muted)', font: '600 14px var(--font-ui)', textDecoration: 'none' }}
              >
                → /bumper/{s}
              </a>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
