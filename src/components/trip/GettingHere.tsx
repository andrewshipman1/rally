'use client';

// Session 9B-1 — Getting Here module (sell+ phases).
// Per-viewer arrival estimator. Three render branches driven by
// (mode, cost_cents):
//   - mode null          → empty prompt + mode picker only
//   - mode set, cost null → picker (active) + dashed estimate input + "(pending)" roll
//   - mode set, cost set  → picker (active) + solid estimate input + $X roll
//
// Mirrors LodgingCard's useTransition + router.refresh() pattern
// (src/components/trip/builder/LodgingCard.tsx:47–80). Data flows
// through upsertArrival (src/app/actions/getting-here.ts) which
// auto-resets cost_cents on mode change.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { ArrivalMode } from '@/types';
import { upsertArrival } from '@/app/actions/getting-here';

type Props = {
  tripId: string;
  slug: string;
  themeId: ThemeId;
  userArrival: { mode: ArrivalMode | null; cost_cents: number | null } | null;
  passportBasedIn: string | null;
  tripDestination: string;
  dateStart: string;
  dateEnd: string;
};

const MODES: ArrivalMode[] = ['flight', 'drive', 'train', 'other'];

function buildFlightUrl(origin: string, dest: string, d1: string, d2: string): string {
  const q = `Flights from ${origin} to ${dest} on ${d1} through ${d2}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
}
function buildDriveUrl(origin: string, dest: string): string {
  return `https://www.google.com/maps/dir/${encodeURIComponent(origin)}/${encodeURIComponent(dest)}`;
}
function buildTransitUrl(origin: string, dest: string): string {
  return `${buildDriveUrl(origin, dest)}/data=!4m2!4m1!3e3`;
}

export function GettingHere({
  tripId,
  slug,
  themeId,
  userArrival,
  passportBasedIn,
  tripDestination,
  dateStart,
  dateEnd,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [localMode, setLocalMode] = useState<ArrivalMode | null>(userArrival?.mode ?? null);
  const [localCost, setLocalCost] = useState<number | null>(userArrival?.cost_cents ?? null);
  const [costDraft, setCostDraft] = useState<string>(
    userArrival?.cost_cents != null ? String(Math.round(userArrival.cost_cents / 100)) : '',
  );

  const handleModePick = (next: ArrivalMode) => {
    if (next === localMode) return;
    setLocalMode(next);
    setLocalCost(null);
    setCostDraft('');
    startTransition(async () => {
      const res = await upsertArrival(tripId, slug, next, null);
      if (res.ok) router.refresh();
    });
  };

  const handleCostCommit = () => {
    if (localMode === null) return;
    const trimmed = costDraft.trim();
    const dollars = trimmed === '' ? null : Number(trimmed.replace(/[^\d.]/g, ''));
    const nextCents =
      dollars == null || Number.isNaN(dollars) ? null : Math.round(dollars * 100);
    if (nextCents === localCost) return;
    setLocalCost(nextCents);
    startTransition(async () => {
      const res = await upsertArrival(tripId, slug, localMode, nextCents);
      if (res.ok) router.refresh();
    });
  };

  const origin = passportBasedIn?.trim() ?? '';
  const dest = tripDestination.trim();
  const hasOrigin = origin.length > 0;

  const refUrl = (() => {
    if (localMode === 'flight') return hasOrigin ? buildFlightUrl(origin, dest, dateStart, dateEnd) : null;
    if (localMode === 'drive') return buildDriveUrl(origin, dest);
    if (localMode === 'train') return buildTransitUrl(origin, dest);
    return null;
  })();

  const helperCopy =
    localMode === null
      ? ''
      : getCopy(themeId, `gettingHere.inputHelper.${localMode}`);
  const refLabel =
    localMode === null || localMode === 'other'
      ? ''
      : getCopy(themeId, `gettingHere.refLinkLabel.${localMode}`);

  const rollIcon = localMode ? getCopy(themeId, `gettingHere.modeIcon.${localMode}`) : '';
  const rollLabel = localMode ? getCopy(themeId, `gettingHere.modeLabel.${localMode}`) : '';
  const rollPrefix = getCopy(themeId, 'gettingHere.rollLine.prefix');
  const pendingLabel = getCopy(themeId, 'gettingHere.rollLine.pending');

  const costFilled = localCost != null;
  const showPassportNudge = localMode === 'flight' && !hasOrigin;

  return (
    <div className="module-section getting-here-module">
      <div className="module-section-header">
        <span className="module-section-title">
          {getCopy(themeId, 'gettingHere.sectionTitle')}
        </span>
        <span className="module-section-caption">
          {getCopy(themeId, 'gettingHere.sectionCaption')}
        </span>
      </div>

      {localMode === null && (
        <div className="module-section-empty">
          <p className="module-section-empty-text">
            {getCopy(themeId, 'gettingHere.emptyPrompt')}
          </p>
        </div>
      )}

      <div className="gh-mode-picker" role="radiogroup" aria-label={getCopy(themeId, 'gettingHere.sectionCaption')}>
        {MODES.map((m) => {
          const active = localMode === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={active}
              className={`gh-mode-tile${active ? ' active' : ''}`}
              onClick={() => handleModePick(m)}
            >
              <span className="gh-mode-icon" aria-hidden="true">
                {getCopy(themeId, `gettingHere.modeIcon.${m}`)}
              </span>
              <span className="gh-mode-label">
                {getCopy(themeId, `gettingHere.modeLabel.${m}`)}
              </span>
            </button>
          );
        })}
      </div>

      {localMode !== null && (
        <>
          <div className={`estimate-input${costFilled ? ' filled' : ''}`}>
            <div className="field-label">{helperCopy}</div>
            <div className="estimate-input-row">
              <span className="estimate-prefix">$</span>
              <input
                className="estimate-field"
                inputMode="numeric"
                type="text"
                placeholder="0"
                value={costDraft}
                onChange={(e) => setCostDraft(e.target.value)}
                onBlur={handleCostCommit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            </div>

            {showPassportNudge ? (
              <div className="gh-passport-nudge">
                {getCopy(themeId, 'gettingHere.passportNudge.before')}
                <a href="/passport">
                  {getCopy(themeId, 'gettingHere.passportNudge.link')}
                </a>
                {getCopy(themeId, 'gettingHere.passportNudge.after')}
              </div>
            ) : refUrl && refLabel ? (
              <a
                className="module-card-pill"
                href={refUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {refLabel}
              </a>
            ) : null}
          </div>

          <div className="gh-roll-line">
            <span>
              {rollPrefix} · {rollIcon} {rollLabel}
            </span>
            {costFilled ? (
              <span className="val">${Math.round((localCost ?? 0) / 100)}</span>
            ) : (
              <span className="val pending">{pendingLabel}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
