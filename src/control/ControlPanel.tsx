import type { CSSProperties, ReactNode } from 'react'
import { useShowState } from '../hooks/useShowState'
import { LOWER_THIRD_KICKER, type LowerThirdVariant, type ShowState } from '../state/showState'

// Regie-Panel: steuert alle Views live, ohne Codeänderung.
// Bewusst funktional, nutzt aber dieselben Tokens wie das Sendesystem.

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
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <input style={field} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
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
        font: '800 13px var(--font-ui)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '10px 12px',
        borderRadius: 'var(--radius-ui)',
        border: '1px solid var(--border-subtle)',
        background: value ? (accent ? 'var(--live-red)' : 'var(--surface)') : 'transparent',
        color: value ? (accent ? '#0a0202' : 'var(--text-primary)') : 'var(--text-muted)',
        cursor: 'pointer',
      }}
    >
      {label}: {value ? 'AN' : 'AUS'}
    </button>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        padding: 16,
      }}
    >
      <h2
        style={{
          font: '400 18px var(--font-display)',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

const VIEWS = [
  'standby',
  'camera',
  'build',
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

  const set = (key: keyof ShowState) => (v: string) => update({ [key]: v } as Partial<ShowState>)

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
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <span className="display" style={{ fontSize: 28 }}>
          BUILD<span className="block" style={{ marginLeft: 4 }} />
        </span>
        <span style={{ ...labelStyle, margin: 0 }}>Regie · Control Panel</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={reset}
          style={{ ...field, width: 'auto', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          Auf Beispielinhalte zurücksetzen
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <Section title="Sendung">
          <Text label="Episodennummer" value={state.episodeNumber} onChange={set('episodeNumber')} />
          <Text label="Episodentitel" value={state.episodeTitle} onChange={set('episodeTitle')} />
          <Text label="Segment-Label (z. B. SIGNAL 01)" value={state.segmentLabel} onChange={set('segmentLabel')} />
          <Text label="Segmenttitel" value={state.segmentTitle} onChange={set('segmentTitle')} />
          <Text label="Standby-Thema" value={state.standbyTopic} onChange={set('standbyTopic')} />
          <Field label="Ablauf · eine Zeile je Segment: LABEL · Titel">
            <textarea
              style={{ ...field, minHeight: 104, resize: 'vertical', lineHeight: 1.5 }}
              value={state.rundown}
              onChange={(e) => update({ rundown: e.target.value })}
            />
          </Field>
          <Text label="Nächste Folge (Endkarte)" value={state.nextShowText} onChange={set('nextShowText')} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <Toggle label="Live" value={state.isLive} onChange={(v) => update({ isLive: v })} accent />
          </div>
        </Section>

        <Section title="Personen">
          <Text label="Name" value={state.presenterName} onChange={set('presenterName')} />
          <Text label="Rolle" value={state.presenterRole} onChange={set('presenterRole')} />
          <Text label="Gast" value={state.guestName} onChange={set('guestName')} />
          <Text label="Gast-Rolle" value={state.guestRole} onChange={set('guestRole')} />
        </Section>

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
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Toggle
              label="Einblenden"
              value={state.lowerThirdVisible}
              onChange={(v) => update({ lowerThirdVisible: v })}
              accent
            />
            <button
              style={{ ...field, width: 'auto', cursor: 'pointer' }}
              onClick={() =>
                update({
                  lowerThirdVariant: 'person',
                  lowerThirdLine1: state.presenterName,
                  lowerThirdLine2: state.presenterRole,
                  lowerThirdVisible: true,
                })
              }
            >
              Host übernehmen
            </button>
            <button
              style={{ ...field, width: 'auto', cursor: 'pointer' }}
              onClick={() =>
                update({
                  lowerThirdVariant: 'gast',
                  lowerThirdLine1: state.guestName,
                  lowerThirdLine2: state.guestRole,
                  lowerThirdVisible: true,
                })
              }
            >
              Gast übernehmen
            </button>
          </div>
        </Section>

        <Section title="Build">
          <Text label="Build-Ziel" value={state.buildGoal} onChange={set('buildGoal')} />
          <Field label={`Schritt (${state.buildStep}/${state.buildStepTotal})`}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min={0}
                max={state.buildStepTotal}
                style={field}
                value={state.buildStep}
                onChange={(e) => update({ buildStep: Number(e.target.value) })}
              />
              <input
                type="number"
                min={1}
                max={12}
                style={field}
                value={state.buildStepTotal}
                onChange={(e) => update({ buildStepTotal: Math.max(1, Number(e.target.value)) })}
              />
            </div>
          </Field>
        </Section>

        <Section title="Kernaussage">
          <Text label="Aussage" value={state.statement} onChange={set('statement')} />
          <Text label="Quelle / Zuordnung" value={state.statementSource} onChange={set('statementSource')} />
        </Section>

        <Section title="Countdown">
          <Field label="Minuten">
            <input
              type="number"
              min={1}
              max={60}
              style={field}
              value={state.countdownMinutes}
              onChange={(e) => update({ countdownMinutes: Math.max(1, Number(e.target.value)) })}
            />
          </Field>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              style={{ ...field, width: 'auto', cursor: 'pointer', borderColor: 'var(--live-red)' }}
              onClick={() => update({ countdownStartedAt: Date.now() })}
            >
              Start
            </button>
            <button
              style={{ ...field, width: 'auto', cursor: 'pointer' }}
              onClick={() => update({ countdownStartedAt: null })}
            >
              Stopp / Reset
            </button>
          </div>
        </Section>

        <Section title="Sichtbarkeit">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <Toggle label="Logo" value={state.showLogo} onChange={(v) => update({ showLogo: v })} />
            <Toggle label="LIVE-Badge" value={state.showLiveBadge} onChange={(v) => update({ showLiveBadge: v })} />
            <Toggle label="Episode" value={state.showEpisode} onChange={(v) => update({ showEpisode: v })} />
            <Toggle label="Segment" value={state.showSegment} onChange={(v) => update({ showSegment: v })} />
            <Toggle label="Nameplate" value={state.showNamePlate} onChange={(v) => update({ showNamePlate: v })} />
            <Toggle label="ZehnX" value={state.showZehnx} onChange={(v) => update({ showZehnx: v })} />
          </div>
        </Section>

        <Section title="Views (OBS Browser-Sources)">
          <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
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
          </div>
        </Section>
      </div>
    </div>
  )
}
