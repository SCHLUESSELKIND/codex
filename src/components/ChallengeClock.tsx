import { useEffect, useState } from 'react'
import { challengeRest, type ShowState } from '../state/showState'

/*
  Die Uhr der 45-Minuten-Challenge.

  Sie ist das Signature-Element des Formats und muss drei Dinge gleichzeitig
  leisten: die Restzeit auf einen Blick, den steigenden Druck ohne Zappeln,
  und den Ausgang (geschafft oder abgelaufen) unmissverständlich.

  Aufbau: ein Ring, der sich leert, mit der Zeit in der Mitte. Der Ring ist
  die Fläche, die aus Entfernung wirkt, die Ziffern tragen die Genauigkeit.
  Farbwechsel bei 10 Minuten (Aufmerksamkeit) und 2 Minuten (Dringlichkeit).
  Nur in der letzten Minute pulst der Ring, vorher steht alles ruhig.
*/

export function useChallengeRest(state: ShowState): number {
  const [jetzt, setJetzt] = useState(() => Date.now())
  useEffect(() => {
    // Viertelsekunde: die Sekundenanzeige springt sauber, ohne unnötige Last.
    const id = window.setInterval(() => setJetzt(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])
  return challengeRest(state, jetzt)
}

export function clockFarbe(state: ShowState, rest: number): string {
  if (state.challengeStatus === 'geschafft') return 'var(--clock-done)'
  if (rest <= 0) return 'var(--clock-critical)'
  if (rest <= 120) return 'var(--clock-critical)'
  if (rest <= 600) return 'var(--clock-warn)'
  return 'var(--clock-normal)'
}

export function clockText(rest: number): string {
  const m = Math.floor(rest / 60)
  const s = rest % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function statusText(state: ShowState, rest: number): string {
  switch (state.challengeStatus) {
    case 'bereit':
      return 'Bereit'
    case 'pause':
      return 'Angehalten'
    case 'geschafft':
      return 'Geschafft'
    case 'abgelaufen':
      return 'Zeit abgelaufen'
    default:
      return rest <= 0 ? 'Zeit abgelaufen' : 'Läuft'
  }
}

interface ClockProps {
  state: ShowState
  /** Außendurchmesser in px */
  size?: number
  /** Beschriftung unter der Zeit ausblenden, etwa in schmalen Leisten */
  kompakt?: boolean
}

export function ChallengeClock({ state, size = 300, kompakt = false }: ClockProps) {
  const rest = useChallengeRest(state)
  const gesamt = Math.max(1, state.challengeMinuten * 60)
  const anteil = Math.max(0, Math.min(1, rest / gesamt))
  const farbe = clockFarbe(state, rest)

  const strich = Math.max(6, Math.round(size * 0.055))
  const radius = (size - strich) / 2
  const umfang = 2 * Math.PI * radius
  const laeuft = state.challengeStatus === 'laeuft'
  const dringend = laeuft && rest > 0 && rest <= 60

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--clock-track)"
          strokeWidth={strich}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={farbe}
          strokeWidth={strich}
          strokeLinecap="butt"
          strokeDasharray={umfang}
          strokeDashoffset={umfang * (1 - anteil)}
          style={{
            transition: 'stroke-dashoffset 400ms linear, stroke 400ms ease',
            animation: dringend ? 'live-pulse 1s ease-in-out infinite' : 'none',
          }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: size * 0.02,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: size * 0.27,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            color: farbe,
          }}
        >
          {state.challengeStatus === 'geschafft' ? clockText(rest) : clockText(rest)}
        </div>
        {!kompakt && (
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              fontSize: size * 0.052,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: state.challengeStatus === 'laeuft' ? 'var(--text-muted)' : farbe,
            }}
          >
            {statusText(state, rest)}
          </div>
        )}
      </div>
    </div>
  )
}

/** Schmale Fassung für Leisten: Balken statt Ring, Zeit rechts. */
export function ChallengeBar({ state, width = 420 }: { state: ShowState; width?: number }) {
  const rest = useChallengeRest(state)
  const gesamt = Math.max(1, state.challengeMinuten * 60)
  const anteil = Math.max(0, Math.min(1, rest / gesamt))
  const farbe = clockFarbe(state, rest)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width }}>
      <div style={{ flex: 1, height: 10, background: 'var(--clock-track)', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'left center',
            transform: `scaleX(${anteil})`,
            background: farbe,
            transition: 'transform 400ms linear, background 400ms ease',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 30,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
          color: farbe,
          minWidth: 96,
          textAlign: 'right',
        }}
      >
        {clockText(rest)}
      </span>
    </div>
  )
}
