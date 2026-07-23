import { useParams, useSearchParams } from 'react-router-dom'
import { Camera } from './Camera'
import { Build } from './Build'
import { Screen } from './Screen'
import { LowerThirdView } from './LowerThirdView'

/*
  Abnahme-Route. Legt ein Overlay über einen simulierten Videohintergrund,
  damit Lesbarkeit ohne OBS geprüft werden kann.

  /preview/camera?bg=light  → helles Videobild (Website-Share, helles Studio)
  /preview/build?bg=code    → dunkler Code-Editor als Screen Content
  /preview/screen?bg=web    → helle Website als Screen Content
  /preview/lower-third?bg=busy → unruhiges Bild, härtester Fall

  Diese Route ist NICHT für den Sendebetrieb. In OBS immer die reinen
  Overlay-Routen verwenden.
*/

const OVERLAYS: Record<string, () => JSX.Element> = {
  camera: Camera,
  build: Build,
  screen: Screen,
  'lower-third': LowerThirdView,
}

function background(kind: string): React.CSSProperties {
  switch (kind) {
    case 'light':
      return { background: 'linear-gradient(135deg, #f2f2ee 0%, #d9d9d2 100%)' }
    case 'code':
      return {
        background:
          'repeating-linear-gradient(180deg, #14161a 0px, #14161a 26px, #171a1f 26px, #171a1f 52px)',
      }
    case 'web':
      return {
        background:
          'linear-gradient(180deg, #ffffff 0%, #ffffff 55%, #eef1f5 55%, #eef1f5 100%)',
      }
    case 'busy':
      return {
        background:
          'conic-gradient(from 45deg, #6b7280, #e5e7eb, #111827, #f9fafb, #4b5563, #6b7280)',
      }
    default:
      return { background: 'linear-gradient(135deg, #1a1a1c 0%, #0a0a0b 100%)' }
  }
}

export function Preview() {
  const { scene } = useParams<{ scene: string }>()
  const [params] = useSearchParams()
  const Overlay = OVERLAYS[scene ?? 'camera'] ?? Camera

  return (
    <div style={{ position: 'fixed', inset: 0, ...background(params.get('bg') ?? 'dark') }}>
      <Overlay />
    </div>
  )
}
