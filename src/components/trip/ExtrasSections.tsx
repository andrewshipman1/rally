'use client';

import { useState } from 'react';
import type { PackingItem } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionLabel } from '@/components/ui/SectionLabel';

export function ExtrasSections({
  packingList,
  playlistUrl,
  houseRules,
  photoAlbumUrl,
}: {
  packingList: PackingItem[];
  playlistUrl: string | null;
  houseRules: string | null;
  photoAlbumUrl: string | null;
}) {
  const items: React.ReactNode[] = [];

  if (packingList.length > 0) {
    items.push(<PackingSection key="packing" items={packingList} />);
  }
  if (playlistUrl) {
    items.push(<PlaylistSection key="playlist" url={playlistUrl} />);
  }
  if (houseRules) {
    items.push(<RulesSection key="rules" rules={houseRules} />);
  }
  if (photoAlbumUrl) {
    items.push(<AlbumSection key="album" url={photoAlbumUrl} />);
  }

  if (items.length === 0) return null;

  return <>{items.map((item, i) => (
    <div key={i} style={{ marginTop: 14 }}>{item}</div>
  ))}</>;
}

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
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform .2s',
          }}
        >
          ⌄
        </span>
      </div>
    </button>
  );
}

function PackingSection({ items }: { items: PackingItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="🎒"
        text="Packing list"
        open={open}
        onToggle={() => setOpen((v) => !v)}
        meta={`${items.length} items`}
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
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function PlaylistSection({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="🎵"
        text="Trip playlist"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
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
          🎵 Open playlist →
        </a>
      )}
    </GlassCard>
  );
}

function RulesSection({ rules }: { rules: string }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard>
      <CollapsibleHeader
        emoji="📜"
        text="House rules"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      />
      {open && (
        <div
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {rules}
        </div>
      )}
    </GlassCard>
  );
}

function AlbumSection({ url }: { url: string }) {
  return (
    <GlassCard>
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
        }}
      >
        <span style={{ fontSize: 24 }}>📸</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Shared photo album</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Open in browser →</div>
        </div>
      </a>
    </GlassCard>
  );
}
