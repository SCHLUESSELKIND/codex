import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CHANNEL_NAME,
  DEFAULT_STATE,
  STORAGE_KEY,
  loadState,
  type ShowState,
} from '../state/showState'

/*
  Abgleich zwischen Regie und Sendeansichten, in drei Ebenen:

  1. Server-Relay (/api/events, /api/state) ist der einzige Weg, der
     Prozessgrenzen überwindet. OBS bringt ein eigenes Chromium mit eigenem
     Speicher, deshalb erreicht ein Regie-Panel in Safari oder Chrome die
     OBS-Quellen NUR über den Server.
  2. BroadcastChannel für sofortigen Abgleich innerhalb derselben
     Browser-Instanz, ohne Umweg über das Netz.
  3. localStorage als Speicher über Neustarts und als Rückfallebene, falls
     die Seite einmal ohne den Vite-Server ausgeliefert wird.
*/

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(CHANNEL_NAME)
}

function merge(patch: Partial<ShowState> | null): ShowState | null {
  if (!patch || typeof patch !== 'object') return null
  return { ...DEFAULT_STATE, ...patch }
}

export function useShowState(): [ShowState, (patch: Partial<ShowState>) => void, () => void] {
  const [state, setState] = useState<ShowState>(loadState)

  // Was zuletzt vom Server kam, wird nicht erneut dorthin zurückgeschickt.
  const letzterServerStand = useRef<string>('')

  useEffect(() => {
    const channel = getChannel()
    const onMessage = (event: MessageEvent) => {
      const next = merge(event.data as Partial<ShowState>)
      if (next) setState(next)
    }
    channel?.addEventListener('message', onMessage)

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(loadState())
    }
    window.addEventListener('storage', onStorage)

    // Server-Relay. EventSource verbindet nach einem Abbruch von selbst neu,
    // ein Serverneustart mitten in der Sendung heilt sich also ohne Zutun.
    let quelle: EventSource | null = null
    try {
      quelle = new EventSource('/api/events')
      quelle.onmessage = (event) => {
        const roh = event.data === 'null' ? null : (JSON.parse(event.data) as Partial<ShowState>)
        const next = merge(roh)
        if (!next) return
        letzterServerStand.current = event.data
        setState(next)
        try {
          localStorage.setItem(STORAGE_KEY, event.data)
        } catch {
          /* Speicher blockiert, Sendung läuft weiter */
        }
      }
    } catch {
      /* Ohne Server läuft alles wie zuvor über die lokalen Wege */
    }

    return () => {
      channel?.removeEventListener('message', onMessage)
      channel?.close()
      window.removeEventListener('storage', onStorage)
      quelle?.close()
    }
  }, [])

  const update = useCallback((patch: Partial<ShowState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      const roh = JSON.stringify(next)

      try {
        localStorage.setItem(STORAGE_KEY, roh)
      } catch {
        /* Speicher voll oder blockiert: die anderen Wege greifen trotzdem */
      }

      const channel = getChannel()
      channel?.postMessage(next)
      channel?.close()

      // An den Server melden, damit OBS und jeder andere Browser es sehen.
      if (roh !== letzterServerStand.current) {
        void fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: roh,
        }).catch(() => {
          /* Kein Server erreichbar: lokaler Betrieb bleibt funktionsfähig */
        })
      }

      return next
    })
  }, [])

  const reset = useCallback(() => {
    update({ ...DEFAULT_STATE })
  }, [update])

  return [state, update, reset]
}

/*
  Einmaliger Abgleich beim Start der Regie: Ist der Server noch leer, weil er
  gerade frisch gestartet wurde, bekommt er den lokal gespeicherten Stand.
  Hat der Server bereits einen Stand, gilt dieser.
*/
export function useRegieSync(state: ShowState, update: (patch: Partial<ShowState>) => void): void {
  const erledigt = useRef(false)

  useEffect(() => {
    if (erledigt.current) return
    erledigt.current = true

    void fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((vorhanden) => {
        if (vorhanden === null) update(state)
      })
      .catch(() => {
        /* Ohne Server bleibt es beim lokalen Betrieb */
      })
    // Absichtlich nur beim ersten Rendern, nicht bei jeder Zustandsänderung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

// Restzeit des Countdowns in Sekunden, tickt lokal pro View.
export function useCountdown(state: ShowState): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])
  if (state.countdownStartedAt === null) return state.countdownMinutes * 60
  const elapsed = Math.floor((now - state.countdownStartedAt) / 1000)
  return Math.max(0, state.countdownMinutes * 60 - elapsed)
}

export function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
