'use client';

// Client-side orchestrator for the sketch-state trip page. Owns the
// `<div className="chassis">` wrapper and the `data-theme` attribute
// so the Phase 6 theme picker can drive live preview via React state
// (no imperative DOM mutation). The wrapper used to live in
// src/app/trip/[slug]/page.tsx but moved here in Phase 6 so the
// picker's preview → commit → revert state machine can stay inside
// React's render cycle.
//
// Responsibilities:
//   - Hold the five inline-editable field values in local state.
//   - Wire the autosave hook (one instance, keyed on tripId).
//   - Compute the ungate boolean on every render from local state
//     plus the server-seeded crewOk flag. Crew changes only update
//     after a full navigation, which is acceptable in phase 4 since
//     invites require the invitee to click through and RSVP.
//   - Render the PostcardHero with sketch overrides, the empty
//     countdown, the crew field, and the builder sticky bar.
//   - Own committedThemeId + previewThemeId; render `.chassis` with
//     `data-theme={previewThemeId ?? committedThemeId}`; mount the
//     ThemePickerSheet at the bottom of the tree.
//   - Auto-open the picker once when landing with ?first=1 (used by
//     the create flow to drop the organizer into the vibe picker).

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import { themePicker } from '@/lib/copy/surfaces/theme-picker';
import type { ThemeId } from '@/lib/themes/types';

import { PostcardHero } from '@/components/trip/PostcardHero';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { ThemePickerSheet } from '@/components/trip/theme-picker/ThemePickerSheet';
import { SketchHeader } from './SketchHeader';
import { SketchCountdownEmpty } from './SketchCountdownEmpty';
import { SketchCrewField } from './SketchCrewField';
import { BuilderStickyBar } from './BuilderStickyBar';
import { useDebouncedAutosave } from '@/lib/builder/useDebouncedAutosave';
import { hasReadyName, hasReadyDate } from '@/lib/builder/ungate';
import { transitionToSell } from '@/app/actions/transition-to-sell';

type MemberLite = {
  id: string;
  user_id: string;
  user: { display_name: string | null } | null;
};

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  organizerId: string;
  organizerName: string;
  coverImageUrl: string | null;
  members: MemberLite[];
  /** Derived on the server via isSketchReady — true iff >=1 non-organizer member exists. */
  crewReady: boolean;
  initial: {
    name: string;
    tagline: string | null;
    destination: string | null;
    date_start: string | null;
    date_end: string | null;
  };
};

export function SketchTripShell({
  themeId,
  tripId,
  slug,
  organizerId,
  organizerName,
  coverImageUrl,
  members,
  crewReady,
  initial,
}: Props) {
  // Seed state from props on mount only; never re-sync from props,
  // or optimistic typing state will be stomped by server refresh.
  const [name, setName] = useState(initial.name);
  const [tagline, setTagline] = useState<string | null>(initial.tagline);
  const [destination, setDestination] = useState<string | null>(initial.destination);
  const [dateStart, setDateStart] = useState<string | null>(initial.date_start);

  // Phase 6 — theme state. Committed reflects server truth; preview is
  // transient while the picker sheet is open. activeThemeId drives the
  // `data-theme` attribute so React always owns the DOM state.
  const [committedThemeId, setCommittedThemeId] = useState<ThemeId>(themeId);
  const [previewThemeId, setPreviewThemeId] = useState<ThemeId | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const activeThemeId = previewThemeId ?? committedThemeId;

  // Auto-open on ?first=1 (create-flow handoff). Guarded by ref so
  // Strict Mode's double-invoke doesn't re-open after replace().
  const sp = useSearchParams();
  const router = useRouter();
  const didAutoOpenRef = useRef(false);
  useEffect(() => {
    if (didAutoOpenRef.current) return;
    if (sp?.get('first') === '1') {
      didAutoOpenRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time auto-open on ?first=1
      setPickerOpen(true);
      router.replace(`/trip/${slug}`);
    }
  }, [sp, router, slug]);

  const { queue, flush } = useDebouncedAutosave(tripId, slug);

  const ready = hasReadyName(name) && hasReadyDate(dateStart, initial.date_end);

  // Scaffolding marquee is ` · `-delimited in the lexicon so each
  // segment lands in its own <span> the same way the live marquee does.
  const marqueeCopy = getCopy(activeThemeId, 'builderState.marqueeScaffolding');
  const marqueeItems = marqueeCopy.split(' · ');

  return (
    <div className="chassis" data-theme={activeThemeId}>
      <PostcardHero
        themeId={activeThemeId}
        tripName={name}
        destination={destination}
        tagline={tagline}
        coverImageUrl={coverImageUrl}
        organizerName={organizerName}
        phase="sketch"
        isLive={false}
        sketchOverrides={{
          marqueeItems,
          stickerText: getCopy(activeThemeId, 'builderState.sticker'),
          liveRowText: getCopy(activeThemeId, 'builderState.liveRow'),
          eyebrowText: getCopy(activeThemeId, 'builderState.eyebrow'),
          renderBody: (
            <SketchHeader
              themeId={activeThemeId}
              name={name}
              tagline={tagline}
              destination={destination}
              dateStart={dateStart}
              onNameChange={(v) => {
                setName(v);
                queue({ name: v });
              }}
              onTaglineChange={(v) => {
                setTagline(v);
                queue({ tagline: v });
              }}
              onDestinationChange={(v) => {
                setDestination(v);
                queue({ destination: v });
              }}
              onDateStartChange={(v) => {
                setDateStart(v);
                queue({ date_start: v || null });
              }}
            />
          ),
        }}
      />

      <SketchCountdownEmpty themeId={activeThemeId} />

      <SketchCrewField
        themeId={activeThemeId}
        tripId={tripId}
        slug={slug}
        members={members}
        organizerId={organizerId}
      />

      {/* Phase 6 — entry point to the theme picker. Solid accent CTA
          so the organizer can't miss it on the sketch page. */}
      <div style={{ padding: '20px 18px 0', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="pick-vibe-btn"
        >
          🎨 {themePicker.pageHeader as string}
        </button>
      </div>

      <PoeticFooter themeId={activeThemeId} />

      {/* Dev bypass: skip sketch→sell gate for QA */}
      {process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_BYPASS === '1' ? (
        <div style={{ padding: '12px 18px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={async () => {
              const res = await fetch(`/api/trips/${tripId}/phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: 'sell' }),
              });
              if (res.ok) {
                window.scrollTo(0, 0);
                router.refresh();
              }
            }}
            style={{
              background: '#333',
              color: '#ff0',
              border: '2px dashed #ff0',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 11,
              fontFamily: 'monospace',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            🔧 DEV: skip to sell phase
          </button>
        </div>
      ) : null}

      <div style={{ height: 90 }} />

      <BuilderStickyBar
        themeId={activeThemeId}
        ready={ready}
        onManualSave={() => void flush()}
        onSendIt={async () => {
          await flush();
          const result = await transitionToSell(tripId, slug);
          if (result.ok) {
            window.scrollTo(0, 0);
            router.refresh();
          }
        }}
      />

      <ThemePickerSheet
        open={pickerOpen}
        onClose={() => {
          setPreviewThemeId(null);
          setPickerOpen(false);
        }}
        committedThemeId={committedThemeId}
        previewThemeId={previewThemeId}
        setPreviewThemeId={setPreviewThemeId}
        tripId={tripId}
        tripName={name}
        slug={slug}
        onCommitted={(next) => {
          setCommittedThemeId(next);
          setPreviewThemeId(null);
        }}
      />
    </div>
  );
}
