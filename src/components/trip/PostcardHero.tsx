// Postcard hero for the chassis trip page. Replaces the old CoverHeader.
//
// Layout per phase 2:
//   - Marquee scrolling strip (top)
//   - .header containing wordmark, eyebrow, title, tagline, sticker
//   - Optional cover image as edge-to-edge backdrop above the .header
//
// All copy is themed via getCopy() with the chassis theme id of the trip.
//
// Phase 4 addition: when `sketchOverrides` is provided, the hero renders
// with builder-state strings + a custom body (inline-editable fields)
// in place of the usual title/tagline. The chassis structure is
// byte-identical to the live path — only the contents swap. When
// `sketchOverrides` is undefined, the component behaves exactly as it
// did pre-phase-4.

import Image from 'next/image';
import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { getCopy } from '@/lib/copy/get-copy';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';

// 9F — length-adaptive title tier (class name → CSS font-size picks the
// tier). Three steps: 60 / 48 / 38 by char count (≤16 / 17–24 / 25+).
// Trims trailing whitespace before measuring — trip names stored with an
// inadvertent trailing space should tier the same as the clean form.
function titleLengthClass(name: string): string {
  const n = name.trimEnd().length;
  if (n <= 16) return 'title t-short';
  if (n <= 24) return 'title t-medium';
  return 'title t-long';
}

// 9F — split trailing !?. off the title so the punctuation can render
// in var(--hot). No trailing punct → no accent span in the DOM.
// Trims the right side first so `"name!!! "` still matches.
function splitTitleAccent(name: string): { base: string; accent: string } {
  const trimmed = name.trimEnd();
  const m = trimmed.match(/([!?.]+)$/);
  if (!m || m.index === undefined) return { base: trimmed, accent: '' };
  return { base: trimmed.slice(0, m.index), accent: m[1] };
}

type InviteeOverrides = {
  /** Text for the inviter row above the wordmark: "{inviter_first} called you up". */
  inviterRowText: string;
  /** Initial for the mini avatar in the inviter row. */
  inviterInitial: string;
  /** Replaces the phase-derived eyebrow (leading ★ is added by the hero). */
  eyebrowText: string;
};

type SketchOverrides = {
  /** Replaces `theme.strings.marquee` for the top scrolling strip. */
  marqueeItems: string[];
  /** Replaces the phase-derived sticker copy. Null suppresses the sticker (9W edit-on-sell). */
  stickerText: string | null;
  /** Forces the live-row to render with this text. Null suppresses the live-row (9W edit-on-sell). */
  liveRowText: string | null;
  /** Replaces the phase-derived eyebrow copy (leading `★` is added by the hero). */
  eyebrowText: string;
  /** Drops a client sub-tree in place of the title + tagline block. */
  renderBody: ReactNode;
  /** Optional postcard image element rendered in the wordmark row. */
  renderPostcard?: ReactNode;
};

type Props = {
  themeId: ThemeId;
  tripName: string;
  destination: string | null;
  tagline: string | null;
  coverImageUrl: string | null;
  organizerName: string;
  /** Trip lifecycle phase, drives sticker copy + eyebrow. */
  phase: 'sketch' | 'sell' | 'lock' | 'go';
  /** Whether to render the live indicator (only true for go phase). */
  isLive?: boolean;
  /** Count of members with rsvp='in' — drives sell marquee "N already in" segment. */
  inCount?: number;
  /** ISO commit_deadline — drives sell marquee "lock it in by {cutoff}" segment. */
  cutoffIso?: string | null;
  /** ISO date_start — drives the sell-phase trip-meta date range. */
  dateStartIso?: string | null;
  /** ISO date_end — drives the sell-phase trip-meta date range. */
  dateEndIso?: string | null;
  /** When set, swaps the hero into sketch-builder mode (see Phase 4). */
  sketchOverrides?: SketchOverrides;
  /** When set, renders the inviter row + eyebrow (Phase 5 invitee state). */
  inviteeOverrides?: InviteeOverrides;
};

export function PostcardHero({
  themeId,
  tripName,
  destination,
  tagline,
  coverImageUrl,
  organizerName,
  phase,
  isLive,
  inCount = 0,
  cutoffIso = null,
  dateStartIso = null,
  dateEndIso = null,
  sketchOverrides,
  inviteeOverrides,
}: Props) {
  const theme = getTheme(themeId);
  const isSketch = !!sketchOverrides;
  // 9E: every sell-specific branch gates on !inviteeOverrides so the
  // InviteeShell teaser stays unchanged on sell-phase trips.
  const isSignedInSell = phase === 'sell' && !inviteeOverrides;

  // Sticker: sketch override wins; otherwise phase-derived default.
  // 9W — sketch override may be null to suppress the sticker (edit-on-sell).
  let sticker: string | null = null;
  if (isSketch) {
    sticker = sketchOverrides.stickerText;
  } else {
    const stickerKey: 'new' | 'invite' | 'locked' =
      phase === 'sketch' ? 'new' : phase === 'sell' ? 'invite' : 'locked';
    sticker =
      typeof theme.strings.sticker[stickerKey] === 'string'
        ? (theme.strings.sticker[stickerKey] as string)
        : (theme.strings.sticker[stickerKey] as (vars: Record<string, unknown>) => string)({});
  }

  // Eyebrow: sketch override → invitee override → phase-derived default.
  const eyebrow = isSketch
    ? sketchOverrides.eyebrowText
    : inviteeOverrides
      ? inviteeOverrides.eyebrowText
      : phase === 'sell'
        ? getCopy(themeId, 'tripPageSell.eyebrow', { organizer: organizerName })
        : phase === 'sketch'
          ? getCopy(themeId, 'tripPageSketch.eyebrow')
          : getCopy(themeId, 'tripPageLock.eyebrow');

  // Marquee: sketch override wins; signed-in sell renders a dynamic
  // template pulling from trip + crew state; everything else (lock /
  // go / done / InviteeShell-on-sell) uses the theme array.
  const cutoffShort = cutoffIso ? format(new Date(cutoffIso), 'MMM d').toLowerCase() : null;
  const marqueeItems: string[] = isSketch
    ? sketchOverrides.marqueeItems
    : isSignedInSell
      ? [
          getCopy(themeId, 'tripPageSell.marquee.calledUp', { organizer: organizerName }),
          ...(cutoffShort
            ? [getCopy(themeId, 'tripPageSell.marquee.lockBy', { cutoff: cutoffShort })]
            : []),
          ...(inCount > 0
            ? [getCopy(themeId, 'tripPageSell.marquee.alreadyIn', { count: inCount })]
            : []),
        ]
      : theme.strings.marquee.map((item) => (typeof item === 'string' ? item : item({})));
  // Duplicate the list so the scroll loop is seamless (phase 2 mockup pattern).
  const marqueeContent = [...marqueeItems, ...marqueeItems];

  // Live-row: sketch forces its own text; go-phase renders via isLive.
  // 9F reverted the 9E sell gate — sell trips no longer show the muted
  // "trip is live" row above the title. `common.live` stays in the
  // lexicon (still consumed when isLive is true on go-phase trips).
  const liveRowText = isSketch ? sketchOverrides.liveRowText : getCopy(themeId, 'common.live');
  // 9W — suppress live row when sketch override is null (edit-on-sell).
  const showLiveRow = liveRowText != null && (isSketch || isLive);

  // 9E: trip-meta row (sell only, data render — no lexicon).
  // Same-month collapse: "Nov 20 → 26"; otherwise "Nov 20 → Dec 2".
  // Partial render when only some of (dates, destination) are set;
  // returns null when all three are unset.
  let tripMetaText: string | null = null;
  if (isSignedInSell) {
    let range: string | null = null;
    if (dateStartIso && dateEndIso) {
      const s = new Date(dateStartIso);
      const e = new Date(dateEndIso);
      const sameMonth = s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();
      range = sameMonth
        ? `${format(s, 'MMM d')} → ${format(e, 'd')}`
        : `${format(s, 'MMM d')} → ${format(e, 'MMM d')}`;
    }
    const parts = [range, destination].filter((p): p is string => !!p);
    tripMetaText = parts.length ? parts.join(' · ') : null;
  }

  return (
    <>
      <div className="status-bar" />
      <div className="marquee">
        <div className="marquee-track">
          {marqueeContent.map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>

      <div className="header">
        {sticker && <div className="sticker">{sticker}</div>}
        {showLiveRow && (
          <div className="live-row">
            {!isSketch && <span className="dot" />} {liveRowText}
          </div>
        )}
        {inviteeOverrides && (
          <div className="inviter">
            <div className="av-mini">{inviteeOverrides.inviterInitial}</div>
            <span className="label">{inviteeOverrides.inviterRowText}</span>
          </div>
        )}
        <div className={`wordmark${isSketch && sketchOverrides.renderPostcard ? ' wordmark-row' : ''}`}>
          <span>{'rally'}<span className="bang">{'!'}</span></span>
          {isSketch && sketchOverrides.renderPostcard}
        </div>
        <div className="eyebrow">{`★ ${eyebrow}`}</div>
        {isSketch ? (
          sketchOverrides.renderBody
        ) : (
          <>
            {(() => {
              const { base, accent } = splitTitleAccent(tripName);
              return (
                <h1 className={titleLengthClass(tripName)}>
                  {base}
                  {accent && <span className="title-accent">{accent}</span>}
                </h1>
              );
            })()}
            {tripMetaText && (
              <div className="trip-meta">{tripMetaText}</div>
            )}
            {(tagline || destination) && (
              <div className="tagline">{tagline || destination}</div>
            )}
            {/* 9G — postcard frame. Cover-present + fallback gradient variants.
                Gated off for InviteeShell (inviteeOverrides) so the teaser
                render is unchanged. Sketch gating is already implicit — this
                branch only runs when !isSketch. */}
            {!inviteeOverrides && (
              <div
                className={`postcard ${coverImageUrl ? 'postcard--image' : 'postcard--fallback'}`}
              >
                {coverImageUrl && (
                  <Image
                    src={coverImageUrl}
                    alt={tripName}
                    width={800}
                    height={450}
                    className="postcard-img-fill"
                    priority
                    unoptimized
                  />
                )}
                {destination && (
                  <div className="postcard-stamp">{destination}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
