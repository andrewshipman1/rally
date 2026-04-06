'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { PackingItem } from '@/types';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ExtraType = 'packing' | 'playlist' | 'rules' | 'album';

const EXTRA_META: Record<ExtraType, { label: string; emoji: string }> = {
  packing:  { label: 'Packing List', emoji: '🎒' },
  playlist: { label: 'Playlist',     emoji: '🎵' },
  rules:    { label: 'House Rules',  emoji: '📜' },
  album:    { label: 'Shared Album', emoji: '📸' },
};

export function TripExtras({
  tripId,
  packingList,
  playlistUrl,
  houseRules,
  photoAlbumUrl,
  onPackingChange,
  onPlaylistChange,
  onRulesChange,
  onAlbumChange,
}: {
  tripId: string;
  packingList: PackingItem[];
  playlistUrl: string | null;
  houseRules: string | null;
  photoAlbumUrl: string | null;
  onPackingChange: (v: PackingItem[]) => void;
  onPlaylistChange: (v: string | null) => void;
  onRulesChange: (v: string | null) => void;
  onAlbumChange: (v: string | null) => void;
}) {
  const [editing, setEditing] = useState<ExtraType | null>(null);
  const [newPackingItem, setNewPackingItem] = useState('');

  const persist = async (field: string, value: unknown) => {
    await supabase.from('trips').update({ [field]: value }).eq('id', tripId);
  };

  const addPackingItem = () => {
    if (!newPackingItem.trim()) return;
    const item: PackingItem = {
      id: `pi-${Date.now()}`,
      text: newPackingItem.trim(),
      checked: false,
    };
    const updated = [...packingList, item];
    onPackingChange(updated);
    persist('packing_list', updated);
    setNewPackingItem('');
  };

  const removePackingItem = (id: string) => {
    const updated = packingList.filter((i) => i.id !== id);
    onPackingChange(updated);
    persist('packing_list', updated);
  };

  const isActive: Record<ExtraType, boolean> = {
    packing: packingList.length > 0,
    playlist: !!playlistUrl,
    rules: !!houseRules,
    album: !!photoAlbumUrl,
  };

  return (
    <div
      style={{
        marginTop: 14,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 18,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 12,
        }}
      >
        ✨ Optional extras
      </div>

      {/* Chip row */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          marginBottom: editing ? 14 : 0,
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {(Object.keys(EXTRA_META) as ExtraType[]).map((key) => {
          const meta = EXTRA_META[key];
          const active = isActive[key];
          const isEditing = editing === key;
          return (
            <button
              key={key}
              onClick={() => setEditing(isEditing ? null : key)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: 20,
                border: isEditing
                  ? '1px solid #fff'
                  : active
                  ? '1px solid rgba(255,255,255,0.4)'
                  : '1px dashed rgba(255,255,255,0.2)',
                background: isEditing
                  ? 'rgba(255,255,255,0.18)'
                  : active
                  ? 'rgba(255,255,255,0.12)'
                  : 'transparent',
                color: active || isEditing ? '#fff' : 'rgba(255,255,255,0.55)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'inherit',
                transition: 'all .15s',
              }}
            >
              {active ? meta.emoji : '+'} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Inline editors */}
      {editing === 'packing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {packingList.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 8,
              }}
            >
              <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{item.text}</span>
              <button
                onClick={() => removePackingItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={newPackingItem}
              onChange={(e) => setNewPackingItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPackingItem()}
              placeholder="Add an item (e.g. swimsuit)"
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={addPackingItem}
              disabled={!newPackingItem.trim()}
              style={{
                padding: '0 16px',
                borderRadius: 8,
                border: 'none',
                background: newPackingItem.trim() ? '#fff' : 'rgba(255,255,255,0.08)',
                color: newPackingItem.trim() ? '#1a3a4a' : 'rgba(255,255,255,0.3)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {editing === 'playlist' && (
        <UrlField
          value={playlistUrl || ''}
          placeholder="https://open.spotify.com/playlist/..."
          onSave={(v) => {
            onPlaylistChange(v || null);
            persist('playlist_url', v || null);
          }}
        />
      )}

      {editing === 'rules' && (
        <textarea
          value={houseRules || ''}
          onChange={(e) => onRulesChange(e.target.value || null)}
          onBlur={() => persist('house_rules', houseRules)}
          placeholder="No shoes inside, quiet hours after 10pm..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.06)',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
      )}

      {editing === 'album' && (
        <UrlField
          value={photoAlbumUrl || ''}
          placeholder="Apple Photos or Google Photos shared album link"
          onSave={(v) => {
            onAlbumChange(v || null);
            persist('photo_album_url', v || null);
          }}
        />
      )}
    </div>
  );
}

function UrlField({
  value: initial,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
}) {
  const [v, setV] = useState(initial);
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => onSave(v.trim())}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)',
        color: '#fff',
        fontSize: 13,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  );
}
