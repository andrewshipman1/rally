// Empty-state countdown card for the sketch builder. Drop-in for
// ChassisCountdown when the trip has no date yet. Server-rendered;
// no client state.

import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = { themeId: ThemeId };

export function SketchCountdownEmpty({ themeId }: Props) {
  return (
    <div className="countdown-empty">
      <div className="cd-flag">{getCopy(themeId, 'builderState.countdownFlag')}</div>
      <div className="cd-num">{getCopy(themeId, 'builderState.countdownNum')}</div>
      <div className="cd-label">{getCopy(themeId, 'builderState.countdownLabel')}</div>
    </div>
  );
}
