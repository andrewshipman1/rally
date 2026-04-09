'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PackingItem } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getCopy } from '@/lib/copy/get-copy';
import {
  addPackingItem,
  removePackingItem,
  setPlaylistUrl,
  setHouseRules,
  setAlbumUrl,
} from '@/app/actions/extras';

type Props = {
  packingList: PackingItem[];
  playlistUrl: string | null;
  houseRules: string | null;
  photoAlbumUrl: string | null;
  isOrganizer?: boolean;
  tripId?: string;
  slug?: string;
  themeId?: ThemeId;
};

export function ExtrasSections({
  packingList,
  playlistUrl,
  houseRules,
  photoAlbumUrl,
  isOrganizer,
  tripId,
  slug,
  themeId,
}: Props) {
  const canEdit = isOrganizer && tripId && slug;
  const t: ThemeId = themeId ?? 'just-because';
  const items: React.ReactNode[] = [];

  if (packingList.length > 0 || canEdit) {
    items.push(
      <PackingSection
        key="packing"
        items={packingList}
        canEdit={!!canEdit}
        tripId={tripId!}
        slug={slug!}
        themeId={t}
      />,
    );
  }
  if (playlistUrl || canEdit) {
    items.push(
      <PlaylistSection
        key="playlist"
        url={playlistUrl}
        canEdit={!!canEdit}
        tripId={tripId!}
        slug={slug!}
        themeId={t}
      />,
    );
  }
  if (houseRules || canEdit) {
    items.push(
      <RulesSection
        key="rules"
        rules={houseRules}
        canEdit={!!canEdit}
        tripId={tripId!}
        slug={slug!}
        themeId={t}
      />,
    );
  }
  if (photoAlbumUrl || canEdit) {
    items.push(
      <AlbumSection
        key="album"
        url={photoAlbumUrl}
        canEdit={!!canEdit}
        tripId={tripId!}
        slug={slug!}
        themeId={t}
      />,
    );
  }

  if (items.length === 0) return null;

  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ marginTop: 14 }}>
          {item}
        </div>
      ))}
    </>
  );
}

// ─── Shared ───────────────────────────────────────────────────────

function CollapsibleHeader({
  emoji,
  text,
  open,
  onToggle,
  meta,
}: {
  emoji: string;
  text: string;
  open: boolean;
  onToggle: () => void;
  meta?: string;
}) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? 'Collapse' : 'Expand'} ${text}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        color: 'inherit',
        fontFamily: 'inherit',
      }}
    >
      <SectionLabel icon={emoji} text={text} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        {meta && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{meta}</span>
        )}
        <span
          aria-hidden="true"
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        >
          {'\u2304'}
        </span>
      </div>
    </button>
  );
}

// ─── Packing ──────────────────────────────────────────────────────

function PackingSection({
  items,
  canEdit,
  tripId,
  slug,
  themeId,
}: {
  items: PackingItem[];
  canEdit: boolean;
  tripId: string;
  slug: string;
  themeId: ThemeId;
}) {
  const [open, setOpen] = useState(canEdit && items.length === 0);
  const [newText, setNewText] = useState('');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return;
    startTransition(async () => {
      const res = await addPackingItem(tripId, slug, text);
      if (res.ok) {
        setNewText('');
        router.refresh();
      }
    });
  };

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      const res = await removePackingItem(tripId, slug, itemId);
      if (res.ok) router.refresh();
    });
  };

  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="🎒"
        text={getCopy(themeId, 'extras.packing.label')}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        meta={items.length > 0 ? `${items.length} items` : undefined}
      />
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: -4 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 0',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13,
              }}
            >
              <span style={{ fontSize: 14 }}>{item.checked ? '☑️' : '⬜'}</span>
              <span style={{ flex: 1 }}>{item.text}</span>
              {canEdit && (
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={pending}
                  aria-label={`Remove ${item.text}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: '0 4px',
                  }}
                >
                  <span aria-hidden="true">{'\u2715'}</span>
                </button>
              )}
            </div>
          ))}
          {canEdit && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={getCopy(themeId, 'extras.packing.placeholder')}
                disabled={pending}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleAdd}
                disabled={pending || !newText.trim()}
                aria-label="Add packing item"
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: pending || !newText.trim() ? 0.5 : 1,
                }}
              >
                <span aria-hidden="true">{'+'}</span>
              </button>
            </div>
          )}
          {!canEdit && items.length === 0 && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              {getCopy(themeId, 'extras.packing.empty')}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ─── Playlist ─────────────────────────────────────────────────────

function PlaylistSection({
  url,
  canEdit,
  tripId,
  slug,
  themeId,
}: {
  url: string | null;
  canEdit: boolean;
  tripId: string;
  slug: string;
  themeId: ThemeId;
}) {
  const [open, setOpen] = useState(!url && canEdit);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url ?? '');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === url) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await setPlaylistUrl(tripId, slug, trimmed);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="🎵"
        text={getCopy(themeId, 'extras.playlist.label')}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          {url && !editing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'block',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 12,
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  wordBreak: 'break-all',
                }}
              >
                {getCopy(themeId, 'extras.playlist.openCta.short')} →
              </a>
              {canEdit && (
                <button
                  onClick={() => { setDraft(url); setEditing(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'inherit',
                  }}
                >
                  {getCopy(themeId, 'extras.menu.edit')}
                </button>
              )}
            </div>
          )}
          {(editing || (!url && canEdit)) && (
            <input
              type="url"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder={getCopy(themeId, 'extras.playlist.empty')}
              disabled={pending}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          )}
        </>
      )}
    </GlassCard>
  );
}

// ─── House rules ──────────────────────────────────────────────────

function RulesSection({
  rules,
  canEdit,
  tripId,
  slug,
  themeId,
}: {
  rules: string | null;
  canEdit: boolean;
  tripId: string;
  slug: string;
  themeId: ThemeId;
}) {
  const [open, setOpen] = useState(!rules && canEdit);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(rules ?? '');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed === (rules ?? '')) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await setHouseRules(tripId, slug, trimmed);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="📜"
        text={getCopy(themeId, 'extras.rules.label')}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <>
          {rules && !editing && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {rules}
              </div>
              {canEdit && (
                <button
                  onClick={() => { setDraft(rules); setEditing(true); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    alignSelf: 'flex-start',
                  }}
                >
                  {getCopy(themeId, 'extras.menu.edit')}
                </button>
              )}
            </div>
          )}
          {(editing || (!rules && canEdit)) && (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              placeholder={getCopy(themeId, 'extras.rules.empty')}
              disabled={pending}
              autoFocus
              rows={4}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          )}
        </>
      )}
    </GlassCard>
  );
}

// ─── Shared album ─────────────────────────────────────────────────

function AlbumSection({
  url,
  canEdit,
  tripId,
  slug,
  themeId,
}: {
  url: string | null;
  canEdit: boolean;
  tripId: string;
  slug: string;
  themeId: ThemeId;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(url ?? '');
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === url) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await setAlbumUrl(tripId, slug, trimmed);
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  if (!url && !canEdit) return null;

  return (
    <GlassCard>
      {url && !editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#fff',
              textDecoration: 'none',
              flex: 1,
            }}
          >
            <span style={{ fontSize: 24 }}>{'\ud83d\udcf8'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {getCopy(themeId, 'extras.album.label')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {getCopy(themeId, 'extras.album.openCta.short')} →
              </div>
            </div>
          </a>
          {canEdit && (
            <button
              onClick={() => { setDraft(url); setEditing(true); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              {getCopy(themeId, 'extras.menu.edit')}
            </button>
          )}
        </div>
      )}
      {(editing || (!url && canEdit)) && (
        <div>
          <SectionLabel icon="📸" text={getCopy(themeId, 'extras.album.label')} />
          <input
            type="url"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={getCopy(themeId, 'extras.album.empty')}
            disabled={pending}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      )}
    </GlassCard>
  );
}
