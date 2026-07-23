import { useCallback, useEffect, useState } from 'react'
import {
  CHANNEL_NAME,
  DEFAULT_STATE,
  STORAGE_KEY,
  loadState,
  type ShowState,
} from '../state/showState'

// Ein Kanal pro Tab reicht; BroadcastChannel verteilt Updates an alle
// offenen OBS-Views und das Control Panel auf derselben Origin.
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  return new BroadcastChannel(CHANNEL_NAME)
}

export function useShowState(): [ShowState, (patch: Partial<ShowState>) => void, () => void] {
  const [state, setState] = useState<ShowState>(loadState)

  useEffect(() => {
    const channel = getChannel()
    const onMessage = (event: MessageEvent) => {
      setState({ ...DEFAULT_STATE, ...(event.data as Partial<ShowState>) })
    }
    channel?.addEventListener('message', onMessage)

    // Fallback für Umgebungen ohne BroadcastChannel: storage-Event
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(loadState())
    }
    window.addEventListener('storage', onStorage)

    return () => {
      channel?.removeEventListener('message', onMessage)
      channel?.close()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const update = useCallback((patch: Partial<ShowState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* Speicher voll oder blockiert: Live-Sync läuft trotzdem */
      }
      const channel = getChannel()
      channel?.postMessage(next)
      channel?.close()
      return next
    })
  }, [])

  const reset = useCallback(() => {
    update({ ...DEFAULT_STATE })
  }, [update])

  return [state, update, reset]
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
