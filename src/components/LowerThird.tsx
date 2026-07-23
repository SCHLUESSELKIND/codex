import { LOWER_THIRD_KICKER, type LowerThirdVariant } from '../state/showState'

interface LowerThirdProps {
  variant: LowerThirdVariant
  line1: string
  line2?: string
  visible: boolean
}

// Bauchbinde: dunkle Platte, harte Kanten, rote Aktivkante links.
// Muss über hellem und dunklem Videobild funktionieren.
export function LowerThird({ variant, line1, line2, visible }: LowerThirdProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 'var(--safe-x)',
        bottom: 'calc(var(--safe-y) + 48px)',
        maxWidth: 1100,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        clipPath: visible ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
        transition:
          'clip-path var(--motion-segment) var(--ease-snap), opacity var(--motion-reveal) var(--ease-snap), transform var(--motion-segment) var(--ease-snap)',
      }}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          borderLeft: 'var(--line-accent) solid var(--live-red)',
          border: 'var(--line-hair) solid var(--border-subtle)',
          borderLeftWidth: 'var(--line-accent)',
          borderLeftColor: 'var(--live-red)',
          borderLeftStyle: 'solid',
          padding: 'var(--space-6) var(--space-8)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.55)',
        }}
      >
        <div className="kicker kicker--red" style={{ marginBottom: 'var(--space-2)' }}>
          {LOWER_THIRD_KICKER[variant]}
        </div>
        <div className="display" style={{ fontSize: 'var(--type-lower-name)' }}>
          {line1}
        </div>
        {line2 && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              fontWeight: 600,
              fontSize: 'var(--type-lower-sub)',
              color: 'var(--text-secondary)',
            }}
          >
            {line2}
          </div>
        )}
      </div>
    </div>
  )
}
