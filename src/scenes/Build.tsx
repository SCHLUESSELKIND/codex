import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import { ZehnxMark } from '../components/Logo'
import { useShowState } from '../hooks/useShowState'

// Szene 03 · Build: großer Screen, Kamera-PiP unten rechts (in OBS platziert).
// Das Overlay liefert nur den PiP-Rahmen, das Build-Ziel und den Fortschritt.
// PiP-Sollposition für OBS: 480x270, rechts unten, Abstand 96/54.

const PIP_W = 480
const PIP_H = 270

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
          right: 'var(--safe-x)',
          bottom: 'calc(var(--safe-y) + 44px)',
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
            position: 'absolute',
            left: 0,
            top: '100%',
            marginTop: 'var(--space-3)',
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
            whiteSpace: 'nowrap',
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
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.55)',
        }}
      >
        <div>
          <div className="kicker kicker--red" style={{ fontSize: 13, marginBottom: 'var(--space-1)' }}>
            Build-Ziel
          </div>
          <div style={{ fontWeight: 800, fontSize: 26 }}>{state.buildGoal}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
