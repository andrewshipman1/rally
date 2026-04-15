'use client';

// Session 8Q — "the aux"
//
// Playlist module rebuild. Three visual states:
//   - Empty (no URL): input + "+" submit + hype hint.
//   - Saved + enriched (url + ogImage): hero card with OG art background,
//     ogTitle, domain chip, "set by {name} · {relativeTime}" byline.
//   - Saved + fallback (url, enrich failed): compact ♫ tile + domain chip
//     + byline. Still tappable, still opens in new tab.
//
// On submit the client calls `/api/enrich` non-blocking; whatever comes
// back (image/title or nulls) is passed to `setPlaylistUrl` alongside
// the URL. Enrichment failure never blocks save.

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

  const caption = getCopy(
    themeId,
    url ? 'extras.playlist.captionSaved' : 'extras.playlist.captionEmpty',
  );

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

  return (
    <section className="module-section aux-section">
      <header className="module-section-header aux-header">
        <div className="aux-title-group">
          <span className="module-section-title">
            {getCopy(themeId, 'extras.playlist.title')}
          </span>
          <Equalizer />
        </div>
        <span className="aux-caption">{caption}</span>
      </header>

      {!url && canEdit && (
        <>
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
        </>
      )}

      {url && ogImage && (
        <>
          <a
            className="aux-saved"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className="aux-hero"
              style={{ backgroundImage: `url(${ogImage})` }}
              aria-hidden="true"
            />
            {canEdit && (
              <button
                type="button"
                className="aux-swap"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSwap();
                }}
                disabled={pending}
              >
                {getCopy(themeId, 'extras.playlist.swap')}
              </button>
            )}
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
          <p className="aux-open-hint">
            {getCopy(themeId, 'extras.playlist.openHint')}
          </p>
        </>
      )}

      {url && !ogImage && (
        <a
          className="aux-fallback"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="aux-fallback-icon" aria-hidden="true">
            ♫
          </span>
          <div className="aux-fallback-body">
            <div className="aux-fallback-domain">
              ↗ {domain ?? url}
            </div>
            {byline && (
              <div className="aux-fallback-byline">{byline}</div>
            )}
          </div>
          {canEdit && (
            <button
              type="button"
              className="aux-fallback-swap"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSwap();
              }}
              disabled={pending}
            >
              {getCopy(themeId, 'extras.playlist.swap')}
            </button>
          )}
        </a>
      )}
    </section>
  );
}
