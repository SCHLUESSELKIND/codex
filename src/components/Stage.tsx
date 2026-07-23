import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

interface StageProps {
  children: ReactNode
  width?: number
  height?: number
  /** Vollbildkarten setzen true, reine Overlays bleiben transparent */
  solid?: boolean
  /** Hilfslinien (Safe Area) einblenden, nur für Design-Checks */
  guides?: boolean
}

// Feste Design-Stage (Standard 1920x1080). Bei abweichender Browsergröße
// wird proportional skaliert, damit OBS und Vorschau identisch aussehen.
export function Stage({ children, width = 1920, height = 1080, solid = false, guides = false }: StageProps) {
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const scale = Math.min(viewport.w / width, viewport.h / height)

  const outer: CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }

  const stage: CSSProperties = {
    width,
    height,
    position: 'relative',
    flex: 'none',
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    background: solid ? 'var(--bg-primary)' : 'transparent',
    overflow: 'hidden',
  }

  return (
    <div style={outer} className="broadcast">
      <div style={stage}>
        {children}
        {guides && (
          <div
            style={{
              position: 'absolute',
              inset: 'var(--safe-y) var(--safe-x)',
              border: '1px dashed rgba(255,43,43,0.5)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  )
}
