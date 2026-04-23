'use client';

// Session 8Q → 9Q — "the aux", Path C orientation.
//
// Three visual states (same outer .module-section.aux-section frame):
//
//   - Empty (no URL): dark hero block ("the aux · who's on?") +
//     input + "+" submit + hype hint on cream below.
//   - Saved + enriched (url + ogImage): OG image IS the hero
//     background (Option A — no darkening overlay by default). Body
//     on cream shows ogTitle, domain chip, byline. Card-wide <a>.
//   - Saved + fallback (url, enrich failed): dark hero with a centered
//     ♫ tile; body on cream shows domain + byline. Card-wide <a>.
//
// The brief locks "no dark tint / gradient overlay on the OG image by
// default" (Andrew 2026-04-23). If an observed OG image ever fails
// title-contrast, revisit via a scoped top-edge gradient — but not
// preemptively.
//
// Swap-it pill appears only when `canEdit` on saved states. When
// `canEdit` is false, the hero shows the "aux cord secured" caption
// instead. This resolves the top-right collision between caption and
// swap pill at 375px without dropping either signal.
//
// On submit the client calls `/api/enrich` non-blocking; whatever
// comes back (image/title or nulls) is passed to `setPlaylistUrl`
// alongside the URL. Enrichment failure never blocks save.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { setPlaylistUrl, clearPlaylistUrl } from '@/app/actions/extras';

type Props = {
  url: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  setByName: string | null;
  setAt: string | null;
  canEdit: boolean;
  tripId: string;
  slug: string;
  themeId: ThemeId;
};

function domainOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function Equalizer() {
  // Four bars with staggered delays — wireframe canonical shape.
  // Reduced-motion is handled globally in globals.css.
  return (
    <span className="aux-eq" aria-hidden="true">
      <span className="aux-eq-bar" />
      <span className="aux-eq-bar" />
      <span className="aux-eq-bar" />
      <span className="aux-eq-bar" />
    </span>
  );
}

export function PlaylistCard({
  url,
  ogImage,
  ogTitle,
  setByName,
  setAt,
  canEdit,
  tripId,
  slug,
  themeId,
}: Props) {
  const [draft, setDraft] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const captionCopy = getCopy(
    themeId,
    url ? 'extras.playlist.captionSaved' : 'extras.playlist.captionEmpty',
  );
  const titleCopy = getCopy(themeId, 'extras.playlist.title');
  const swapCopy = getCopy(themeId, 'extras.playlist.swap');
  const openHintCopy = getCopy(themeId, 'extras.playlist.openHint');

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || pending) return;

    // Best-effort enrichment. Never blocks save — any failure (network,
    // CORS, 4xx/5xx, JSON parse) falls through to the null fallback.
    let ogImageOut: string | null = null;
    let ogTitleOut: string | null = null;
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          image?: string | null;
          title?: string | null;
        };
        ogImageOut = data.image ?? null;
        ogTitleOut = data.title ?? null;
      }
    } catch {
      // swallow — fallback path handles it
    }

    startTransition(async () => {
      const result = await setPlaylistUrl(tripId, slug, trimmed, {
        ogImage: ogImageOut,
        ogTitle: ogTitleOut,
      });
      if (result.ok) {
        setDraft('');
        router.refresh();
      }
    });
  };

  const handleSwap = () => {
    if (!canEdit || pending) return;
    startTransition(async () => {
      const result = await clearPlaylistUrl(tripId, slug);
      if (result.ok) router.refresh();
    });
  };

  const domain = domainOf(url);
  const when = setAt
    ? formatDistanceToNow(new Date(setAt), { addSuffix: false })
    : null;
  const byline = url
    ? getCopy(themeId, 'extras.playlist.byline', {
        name: setByName ?? 'the crew',
        when: when ?? 'just now',
      })
    : null;

  // Hero top-row slot: swap pill takes precedence over caption when the
  // viewer can edit a saved aux. Resolves the 375px collision between
  // the two top-right signals.
  const renderHeroTopRight = () => {
    if (url && canEdit) {
      return (
        <button
          type="button"
          className="aux-swap-pill"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSwap();
          }}
          disabled={pending}
        >
          {swapCopy}
        </button>
      );
    }
    return <span className="aux-hero-caption">{captionCopy}</span>;
  };

  const renderHeroTop = () => (
    <div className="aux-hero-top">
      <div className="aux-title-group">
        <span className="module-section-title">{titleCopy}</span>
        <Equalizer />
      </div>
      {renderHeroTopRight()}
    </div>
  );

  return (
    <section className="module-section aux-section">
      {/* Empty — dark hero + input card on cream. */}
      {!url && canEdit && (
        <>
          <div className="aux-hero-block aux-hero-empty">{renderHeroTop()}</div>
          <div className="aux-body">
            <div className="aux-empty-card">
              <input
                type="url"
                className="aux-empty-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder={getCopy(themeId, 'extras.playlist.placeholder')}
                disabled={pending}
                aria-label={getCopy(themeId, 'extras.playlist.placeholder')}
              />
              <button
                type="button"
                className="aux-submit"
                onClick={() => void handleSubmit()}
                disabled={pending || !draft.trim()}
                aria-label="save link"
              >
                +
              </button>
            </div>
            <p className="aux-hype-hint">
              {getCopy(themeId, 'extras.playlist.hypeHint')}
            </p>
          </div>
        </>
      )}

      {/* Saved + enriched — OG image as hero background (Option A). */}
      {url && ogImage && (
        <>
          <a
            className="aux-card-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className="aux-hero-block aux-hero-image"
              style={{ backgroundImage: `url(${ogImage})` }}
            >
              {renderHeroTop()}
            </div>
            <div className="aux-body">
              <div className="aux-title">{ogTitle ?? domain ?? url}</div>
              <div className="aux-meta">
                {domain && (
                  <span className="aux-domain-chip">↗ {domain}</span>
                )}
              </div>
              {byline && <div className="aux-byline">{byline}</div>}
            </div>
          </a>
          <p className="aux-footer-caption">{openHintCopy}</p>
        </>
      )}

      {/* Saved + fallback (enrich failed) — dark hero with ♫ tile centered. */}
      {url && !ogImage && (
        <>
          <a
            className="aux-card-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="aux-hero-block aux-hero-fallback">
              {renderHeroTop()}
              <span className="aux-fallback-icon" aria-hidden="true">
                ♫
              </span>
            </div>
            <div className="aux-body">
              <div className="aux-fallback-domain">↗ {domain ?? url}</div>
              {byline && <div className="aux-fallback-byline">{byline}</div>}
            </div>
          </a>
          <p className="aux-footer-caption">{openHintCopy}</p>
        </>
      )}
    </section>
  );
}
