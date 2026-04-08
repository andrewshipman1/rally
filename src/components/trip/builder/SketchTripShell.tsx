'use client';

// Client-side orchestrator for the sketch-state trip page. Lives
// inside a <div className="chassis"> that the server page owns, so
// the data-theme attribute and postcard cover are outside this tree.
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

import { useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

import { PostcardHero } from '@/components/trip/PostcardHero';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { SketchHeader } from './SketchHeader';
import { SketchCountdownEmpty } from './SketchCountdownEmpty';
import { SketchCrewField } from './SketchCrewField';
import { BuilderStickyBar } from './BuilderStickyBar';
import { useDebouncedAutosave } from '@/lib/builder/useDebouncedAutosave';
import { hasReadyName, hasReadyDate } from '@/lib/builder/ungate';

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

  const { queue, flush } = useDebouncedAutosave(tripId, slug);

  const ready = hasReadyName(name) && hasReadyDate(dateStart, initial.date_end) && crewReady;

  // Scaffolding marquee is ` · `-delimited in the lexicon so each
  // segment lands in its own <span> the same way the live marquee does.
  const marqueeCopy = getCopy(themeId, 'builderState.marqueeScaffolding');
  const marqueeItems = marqueeCopy.split(' · ');

  return (
    <>
      <PostcardHero
        themeId={themeId}
        tripName={name}
        destination={destination}
        tagline={tagline}
        coverImageUrl={coverImageUrl}
        organizerName={organizerName}
        phase="sketch"
        isLive={false}
        sketchOverrides={{
          marqueeItems,
          stickerText: getCopy(themeId, 'builderState.sticker'),
          liveRowText: getCopy(themeId, 'builderState.liveRow'),
          eyebrowText: getCopy(themeId, 'builderState.eyebrow'),
          renderBody: (
            <SketchHeader
              themeId={themeId}
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

      <SketchCountdownEmpty themeId={themeId} />

      <SketchCrewField
        themeId={themeId}
        slug={slug}
        members={members}
        organizerId={organizerId}
      />

      <PoeticFooter themeId={themeId} />

      <div style={{ height: 90 }} />

      <BuilderStickyBar
        themeId={themeId}
        ready={ready}
        onManualSave={() => void flush()}
        onSendIt={() => {
          // Phase 4: stub. Phase 5+ wires the sketch → sell phase
          // transition here. For now, manual flush and let the
          // organizer share the URL from their browser.
          void flush();
        }}
      />
    </>
  );
}
