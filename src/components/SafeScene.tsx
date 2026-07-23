import { Component, type ReactNode } from 'react'

/*
  Sendesicherheit: Ein Renderfehler darf im Livebetrieb nie ein weißes Bild
  erzeugen. Die Boundary fängt ab und liefert einen transparenten,
  stummen Zustand. Das Videobild bleibt sichtbar, das Overlay verschwindet
  einfach. Die Ursache steht in der Konsole.
*/

export class SafeScene extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[BOP] Szene konnte nicht gerendert werden:', error)
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
