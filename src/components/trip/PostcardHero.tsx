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
import { getCopy } from '@/lib/copy/get-copy';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';

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
  /** Replaces the phase-derived sticker copy. */
  stickerText: string;
  /** Forces the live-row to render with this text, regardless of `isLive`. */
  liveRowText: string;
  /** Replaces the phase-derived eyebrow copy (leading `★` is added by the hero). */
  eyebrowText: string;
  /** Drops a client sub-tree in place of the title + tagline block. */
  renderBody: ReactNode;
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
  sketchOverrides,
  inviteeOverrides,
}: Props) {
  const theme = getTheme(themeId);
  const isSketch = !!sketchOverrides;

  // Sticker: sketch override wins; otherwise phase-derived default.
  let sticker: string;
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

  // Marquee: sketch override wins; otherwise theme-provided array.
  const marqueeItems: string[] = isSketch
    ? sketchOverrides.marqueeItems
    : theme.strings.marquee.map((item) => (typeof item === 'string' ? item : item({})));
  // Duplicate the list so the scroll loop is seamless (phase 2 mockup pattern).
  const marqueeContent = [...marqueeItems, ...marqueeItems];

  // Live-row: sketch forces its own text; live path only renders when isLive.
  const showLiveRow = isSketch || isLive;
  const liveRowText = isSketch ? sketchOverrides.liveRowText : getCopy(themeId, 'common.live');

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

      {coverImageUrl && (
        <div className="postcard-cover">
          <Image
            src={coverImageUrl}
            alt={tripName}
            width={800}
            height={450}
            className="postcard-cover-img"
            priority
            unoptimized
          />
        </div>
      )}

      <div className="header">
        <div className="sticker">{sticker}</div>
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
        <div className="wordmark">{'rally'}<span className="bang">{'!'}</span></div>
        <div className="eyebrow">{`★ ${eyebrow}`}</div>
        {isSketch ? (
          sketchOverrides.renderBody
        ) : (
          <>
            <h1 className="title">{tripName}</h1>
            {(tagline || destination) && (
              <div className="tagline">{tagline || destination}</div>
            )}
          </>
        )}
      </div>
    </>
  );
}
