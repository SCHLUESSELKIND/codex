import { Component, type ReactNode } from 'react'

/*
  Sendesicherheit: Ein Renderfehler darf im Livebetrieb nie ein weißes Bild
  erzeugen. Die Boundary fängt ab und liefert einen transparenten, stummen
  Zustand. Das Videobild bleibt sichtbar, das Overlay verschwindet einfach.

  Zweiter, ebenso wichtiger Teil: Sie versucht sich zu erholen. Ohne das bliebe
  ein Overlay nach einer einzigen kaputten Eingabe für den Rest der Sendung
  schwarz, auch wenn die Ursache längst behoben ist. Nach kurzer Wartezeit wird
  deshalb neu gerendert. Klappt es wieder, ist das Bild zurück, ohne dass
  jemand die Quelle in OBS anfassen muss.

  Die Wartezeit steigt bei wiederholtem Scheitern, damit ein dauerhaft kaputter
  Zustand nicht in eine Endlosschleife läuft, die CPU frisst.
*/

const WARTEZEIT_MS = 2000
const MAX_WARTEZEIT_MS = 30000

interface State {
  failed: boolean
  versuch: number
}

export class SafeScene extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false, versuch: 0 }
  private timer: number | null = null

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[BOP] Szene konnte nicht gerendert werden:', error)
    this.planeNeustart()
  }

  componentWillUnmount() {
    if (this.timer !== null) window.clearTimeout(this.timer)
  }

  private planeNeustart() {
    if (this.timer !== null) window.clearTimeout(this.timer)
    const wartezeit = Math.min(MAX_WARTEZEIT_MS, WARTEZEIT_MS * 2 ** this.state.versuch)
    this.timer = window.setTimeout(() => {
      this.setState((prev) => ({ failed: false, versuch: prev.versuch + 1 }))
    }, wartezeit)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
