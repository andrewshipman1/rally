import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  activitiesDollars: number | null;
  provisionsDollars: number | null;
  otherDollars: number | null;
};

export function EverythingElse({
  themeId,
  activitiesDollars,
  provisionsDollars,
  otherDollars,
}: Props) {
  return (
    <div className="module-section everything-else-module" style={{ marginTop: 14 }}>
      <div className="module-section-header">
        <span className="module-section-title">
          {getCopy(themeId, 'builderState.everythingElse.title')}
        </span>
        <span className="module-section-count">
          {getCopy(themeId, 'builderState.everythingElse.eyebrow')}
        </span>
      </div>
      <div className="everything-else-rows">
        {(activitiesDollars ?? 0) > 0 && (
          <div className="estimate-input filled">
            <div className="field-label">
              {getCopy(themeId, 'builderState.everythingElse.activitiesLabel')}
            </div>
            <div className="estimate-input-row">
              <span className="estimate-prefix">
                {getCopy(themeId, 'builderState.estimatePrefix')}
              </span>
              <span className="estimate-display">
                {(activitiesDollars ?? 0).toLocaleString('en-US')}
              </span>
            </div>
            <p className="estimate-input-hint">
              {getCopy(themeId, 'builderState.everythingElse.activitiesHint')}
            </p>
          </div>
        )}
        {(provisionsDollars ?? 0) > 0 && (
          <div className="estimate-input filled">
            <div className="field-label">
              {getCopy(themeId, 'builderState.everythingElse.provisionsLabel')}
            </div>
            <div className="estimate-input-row">
              <span className="estimate-prefix">
                {getCopy(themeId, 'builderState.estimatePrefix')}
              </span>
              <span className="estimate-display">
                {(provisionsDollars ?? 0).toLocaleString('en-US')}
              </span>
            </div>
            <p className="estimate-input-hint">
              {getCopy(themeId, 'builderState.everythingElse.provisionsHint')}
            </p>
          </div>
        )}
        {(otherDollars ?? 0) > 0 && (
          <div className="estimate-input filled">
            <div className="field-label">
              {getCopy(themeId, 'builderState.everythingElse.otherLabel')}
            </div>
            <div className="estimate-input-row">
              <span className="estimate-prefix">
                {getCopy(themeId, 'builderState.estimatePrefix')}
              </span>
              <span className="estimate-display">
                {(otherDollars ?? 0).toLocaleString('en-US')}
              </span>
            </div>
            <p className="estimate-input-hint">
              {getCopy(themeId, 'builderState.everythingElse.otherHint')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
