import { Stage } from '../components/Stage'
import { LowerThird } from '../components/LowerThird'
import { useShowState } from '../hooks/useShowState'

// Eigenständige Bauchbinden-Source: kann in OBS über jede Szene gelegt werden.
export function LowerThirdView() {
  const [state] = useShowState()
  return (
    <Stage>
      <LowerThird
        variant={state.lowerThirdVariant}
        line1={state.lowerThirdLine1}
        line2={state.lowerThirdLine2}
        visible={state.lowerThirdVisible}
      />
    </Stage>
  )
}
