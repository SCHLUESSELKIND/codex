import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import { ZehnxMark } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'
import geometry from '../data/geometry.json'

/*
  Szene 03 · Build: großer Screen, Kamera-PiP unten rechts (in OBS platziert).
  Das Overlay liefert nur den PiP-Rahmen, das Build-Ziel und den Fortschritt.

  Die Rahmenposition kommt aus src/data/geometry.json, dieselbe Datei, aus der
  auch scripts/obs-setup.mjs die Kamera positioniert. Nur so sitzt die Kamera
  wirklich in den gezeichneten Eckmarken.
*/

const PIP = geometry.cameraPip
const PIP_W = PIP.width
const PIP_H = PIP.height

export function Build() {
  const [state] = useShowState()
  const blocks = Array.from({ length: state.buildStepTotal }, (_, i) => i < state.buildStep)

  return (
    <Stage>
      <TopBar state={state} />

      {/* Kamera-Rahmen: präzise Eckmarken statt schwerem Kasten */}
      <div
        style={{
          position: 'absolute',
          left: PIP.x,
          top: PIP.y,
          width: PIP_W,
          height: PIP_H,
        }}
      >
        {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
          <div
            key={corner}
            style={{
              position: 'absolute',
              width: 26,
              height: 26,
              ...(corner.includes('t') ? { top: -2 } : { bottom: -2 }),
              ...(corner.includes('l') ? { left: -2 } : { right: -2 }),
              borderTop: corner.includes('t') ? 'var(--line-strong) solid var(--text-primary)' : 'none',
              borderBottom: corner.includes('b') ? 'var(--line-strong) solid var(--text-primary)' : 'none',
              borderLeft: corner.includes('l') ? 'var(--line-strong) solid var(--text-primary)' : 'none',
              borderRight: corner.includes('r') ? 'var(--line-strong) solid var(--text-primary)' : 'none',
            }}
          />
        ))}
        <div
          style={{
            // Rechtsbündig am PiP verankert: ein langer Name wächst nach links
            // ins Bild statt über den rechten Rand hinaus.
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: 'var(--space-3)',
            maxWidth: 900,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <span style={{ fontWeight: 800, fontSize: 20 }}>{state.presenterName}</span>
          <span className="meta" style={{ fontSize: 14 }}>
            {state.presenterRole}
          </span>
        </div>
      </div>

      {/* Build-Ziel unten links */}
      <div
        style={{
          position: 'absolute',
          left: 'var(--safe-x)',
          bottom: 'var(--safe-y)',
          background: 'var(--bg-primary)',
          border: 'var(--line-hair) solid var(--border-subtle)',
          borderLeft: 'var(--line-accent) solid var(--live-red)',
          padding: 'var(--space-3) var(--space-6)',
          // Begrenzt, damit die Platte bei einem langen Build-Ziel nicht bis
          // unter den Kamera-PiP wächst und dessen Namenszeile überdeckt.
          maxWidth: 1050,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.55)',
        }}
      >
        <div>
          <div className="kicker kicker--red" style={{ fontSize: 13, marginBottom: 'var(--space-1)' }}>
            Build-Ziel
          </div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 26,
              // Einzeilig und notfalls gekürzt: das Build-Ziel ist eine
              // Statuszeile, kein Fließtext, und darf die Platte nicht sprengen.
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 700,
            }}
          >
            {state.buildGoal}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 'none' }}>
          <span className="meta" style={{ fontSize: 14 }}>
            Schritt {state.buildStep}/{state.buildStepTotal}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {blocks.map((done, i) => (
              <span
                key={i}
                style={{
                  width: 14,
                  height: 18,
                  background: done ? 'var(--live-red)' : 'transparent',
                  border: done ? 'none' : 'var(--line-hair) solid var(--border-strong)',
                  transition: 'background var(--motion-micro) var(--ease-snap)',
                }}
              />
            ))}
          </div>
        </div>
        {state.showZehnx && <ZehnxMark size={12} />}
      </div>
    </Stage>
  )
}
