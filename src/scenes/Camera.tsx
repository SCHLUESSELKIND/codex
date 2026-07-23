import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import { LowerThird } from '../components/LowerThird'
import { useShowState } from '../hooks/useShowState'

// Szene 02 · Kamera: transparentes Overlay, Kamera bleibt dominant.
export function Camera() {
  const [state] = useShowState()
  return (
    <Stage>
      <TopBar state={state} segment={state.segmentLabel} />
      {state.showNamePlate && (
        <LowerThird
          variant={state.lowerThirdVariant}
          line1={state.lowerThirdLine1 || state.presenterName}
          line2={state.lowerThirdLine2 || state.presenterRole}
          visible={state.lowerThirdVisible}
        />
      )}
    </Stage>
  )
}
