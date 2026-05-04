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
//   - Hold the inline-editable field values in local state.
//   - Wire the autosave hook (one instance, keyed on tripId).
//   - Compute the ungate boolean on every render from local state
//     plus the server-seeded crewOk flag. Crew changes only update
//     after a full navigation, which is acceptable in phase 4 since
//     invites require the invitee to click through and RSVP.
//   - Render the PostcardHero with sketch overrides, the crew field,
//     and the builder sticky bar.
//   - Own committedThemeId + previewThemeId; render `.chassis` with
//     `data-theme={previewThemeId ?? committedThemeId}`; mount the
//     ThemePickerSheet at the bottom of the tree.
//   - Auto-open the picker once when landing with ?first=1 (used by
//     the create flow to drop the organizer into the vibe picker).

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

import type { Lodging, Transport, Grocery, PackingItem, TripPhase } from '@/types';
import type { HeadlinerData } from './Headliner';
import { PostcardHero } from '@/components/trip/PostcardHero';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { ThemePickerSheet } from '@/components/trip/theme-picker/ThemePickerSheet';
import { ExtrasSections } from '@/components/trip/ExtrasSections';
import { SketchHeader } from './SketchHeader';
import { PostcardImage } from './PostcardImage';
import { SketchInviteList } from './SketchInviteList';
import { SketchModules } from './SketchModules';
import { BuilderStickyBar } from './BuilderStickyBar';
import { useDebouncedAutosave } from '@/lib/builder/useDebouncedAutosave';
import { hasReadyName, hasReadyDate } from '@/lib/builder/ungate';
import { transitionToSell } from '@/app/actions/transition-to-sell';
import { AppHeader } from '@/components/AppHeader';

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  /** Session 11 — current viewer's profile, threaded for the AppHeader
   * avatar. Null when unauth (avatar is hidden). */
  viewerProfile: { displayName: string; profilePhotoUrl: string | null } | null;
  organizerName: string;
  organizerId: string;
  coverImageUrl: string | null;
  members: { id: string; user_id: string; role: string; user: { display_name: string | null; email: string | null; phone: string } | null }[];
  /** Session 9J — divisor for per-person cost math. Sourced from
   * `cost.divisor_used` in page.tsx (in+holding, fallback to group_size). */
  crewCount: number;
  lodging: Lodging[];
  transport: Transport[];
  groceries: Grocery[];
  packingList: PackingItem[];
  playlistUrl: string | null;
  /** Session 8Q — OG enrichment + curator for "the aux" saved state. */
  playlistOgImage: string | null;
  playlistOgTitle: string | null;
  playlistSetByName: string | null;
  playlistSetAt: string | null;
  houseRules: string | null;
  photoAlbumUrl: string | null;
  /** Session 8Q — extras phase-gate. Sketch shell is always `sketch`, but
   * ExtrasSections needs the phase to decide which sections render. */
  phase: TripPhase;
  /** Session 8J — "the headliner" (optional, singular trip-level). */
  headliner: HeadlinerData;
  /** Session 8K — sketch-phase activities per-person estimate (whole dollars). */
  activitiesEstimate: number | null;
  initial: {
    name: string;
    tagline: string | null;
    destination: string | null;
    date_start: string | null;
    date_end: string | null;
    commit_deadline: string | null;
  };
  /** 9W — 'sketch' for true sketch-phase trips (default); 'edit-on-sell'
   * for the organizer editing a published sell-phase trip via ?edit=1.
   * Edit-on-sell suppresses sketch signifiers (sticker, live row) and
   * swaps the publish button for done-editing. */
  mode?: 'sketch' | 'edit-on-sell';
};

export function SketchTripShell({
  themeId,
  tripId,
  slug,
  viewerProfile,
  organizerName,
  organizerId,
  coverImageUrl,
  members,
  crewCount,
  lodging,
  transport,
  groceries,
  packingList,
  playlistUrl,
  playlistOgImage,
  playlistOgTitle,
  playlistSetByName,
  playlistSetAt,
  houseRules,
  photoAlbumUrl,
  phase,
  headliner,
  activitiesEstimate,
  initial,
  mode = 'sketch',
}: Props) {
  const isEditOnSell = mode === 'edit-on-sell';
  // Seed state from props on mount only; never re-sync from props,
  // or optimistic typing state will be stomped by server refresh.
  const [name, setName] = useState(initial.name);
  const [tagline, setTagline] = useState<string | null>(initial.tagline);
  const [destination, setDestination] = useState<string | null>(initial.destination);
  const [dateStart, setDateStart] = useState<string | null>(initial.date_start);
  const [dateEnd, setDateEnd] = useState<string | null>(initial.date_end);
  const [commitDeadline, setCommitDeadline] = useState<string | null>(initial.commit_deadline);
  const [localCoverImageUrl, setLocalCoverImageUrl] = useState<string | null>(coverImageUrl);

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

  const ready = hasReadyName(name) && hasReadyDate(dateStart, dateEnd);

  // Scaffolding marquee is ` · `-delimited in the lexicon so each
  // segment lands in its own <span> the same way the live marquee does.
  const marqueeCopy = getCopy(activeThemeId, 'builderState.marqueeScaffolding');
  const marqueeItems = marqueeCopy.split(' · ');

  return (
    <div className="chassis" data-theme={activeThemeId}>
      {/* Session 11 polish (Cowork, 2026-05-03): AppHeader is now passed
          INTO PostcardHero as `topChrome` so it renders between the
          marquee and the hero, matching the dashboard's marquee →
          header → content order. */}
      <PostcardHero
        topChrome={<AppHeader user={viewerProfile} />}
        themeId={activeThemeId}
        tripName={name}
        destination={destination}
        tagline={tagline}
        coverImageUrl={localCoverImageUrl}
        organizerName={organizerName}
        phase="sketch"
        isLive={false}
        sketchOverrides={{
          marqueeItems,
          // 9W — suppress sketch signifiers in edit-on-sell mode. The
          // sticker ("new rally ✨") and live row ("draft · only you can
          // see this") both lie for a published trip — hide them.
          stickerText: isEditOnSell ? null : getCopy(activeThemeId, 'builderState.sticker'),
          liveRowText: isEditOnSell ? null : getCopy(activeThemeId, 'builderState.liveRow'),
          eyebrowText: getCopy(activeThemeId, 'builderState.eyebrow'),
          renderPostcard: (
            <PostcardImage
              tripId={tripId}
              imageUrl={localCoverImageUrl}
              onImageChange={(url) => {
                setLocalCoverImageUrl(url);
                queue({ cover_image_url: url });
              }}
            />
          ),
          renderBody: (
            <SketchHeader
              themeId={activeThemeId}
              name={name}
              tagline={tagline}
              destination={destination}
              dateStart={dateStart}
              dateEnd={dateEnd}
              commitDeadline={commitDeadline}
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
                // Session 8L — silent auto-correct: if the new start is
                // after the current end, snap end to match. ISO date
                // strings compare lexicographically (YYYY-MM-DD).
                if (v && dateEnd && v > dateEnd) {
                  setDateStart(v);
                  setDateEnd(v);
                  queue({ date_start: v, date_end: v });
                } else {
                  setDateStart(v);
                  queue({ date_start: v || null });
                }
              }}
              onDateEndChange={(v) => {
                // Session 8L — silent auto-correct: if the new end is
                // before the current start, snap start to match.
                if (v && dateStart && v < dateStart) {
                  setDateStart(v);
                  setDateEnd(v);
                  queue({ date_start: v, date_end: v });
                } else {
                  setDateEnd(v);
                  queue({ date_end: v || null });
                }
              }}
              onCommitDeadlineChange={(v) => {
                setCommitDeadline(v);
                queue({ commit_deadline: v || null });
              }}
            />
          ),
        }}
      />

      {/* Countdown hidden in sketch — appears in sell+ via page.tsx phase logic */}

      <SketchInviteList
        themeId={activeThemeId}
        tripId={tripId}
        slug={slug}
        members={members}
        organizerId={organizerId}
      />

      <SketchModules
        themeId={activeThemeId}
        tripId={tripId}
        slug={slug}
        dateStart={dateStart}
        dateEnd={dateEnd}
        lodging={lodging}
        transport={transport}
        groceries={groceries}
        crewCount={crewCount}
        headliner={headliner}
        activitiesEstimate={activitiesEstimate}
      />

      <ExtrasSections
        phase={phase}
        packingList={packingList}
        playlistUrl={playlistUrl}
        playlistOgImage={playlistOgImage}
        playlistOgTitle={playlistOgTitle}
        playlistSetByName={playlistSetByName}
        playlistSetAt={playlistSetAt}
        houseRules={houseRules}
        photoAlbumUrl={photoAlbumUrl}
        isOrganizer
        tripId={tripId}
        slug={slug}
        themeId={activeThemeId}
      />

      <PoeticFooter themeId={activeThemeId} />


      <div style={{ height: 90 }} />

      <BuilderStickyBar
        themeId={activeThemeId}
        ready={ready}
        mode={mode}
        onBack={() => router.push('/')}
        onThemeOpen={() => setPickerOpen(true)}
        onManualSave={() => void flush()}
        onPublish={async () => {
          await flush();
          const result = await transitionToSell(tripId, slug);
          if (result.ok) {
            window.scrollTo(0, 0);
            router.refresh();
          }
        }}
        onDone={async () => {
          // 9W — edit-on-sell exit: flush any pending autosave, then
          // strip `?edit=1` by navigating back to the bare trip path.
          // Phase stays 'sell' — no transition, no republish.
          await flush();
          router.push(`/trip/${slug}`);
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
