'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Block, BlockCostType } from '@/types';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EMOJI_OPTIONS = ['🏠', '✈️', '🚗', '🤿', '🍽️', '🧘', '🎉', '🏄', '⛷️', '🎵', '📍', '💡'];

export function BlockEditor({
  tripId,
  blocks: initialBlocks,
  onBlocksChange,
}: {
  tripId: string;
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCostType, setNewCostType] = useState<BlockCostType>('shared');
  const [newTag, setNewTag] = useState('');
  const [newEmoji, setNewEmoji] = useState('📍');
  const [enriching, setEnriching] = useState(false);
  const [saving, setSaving] = useState(false);

  const enrichLink = async (url: string) => {
    if (!url) return;
    setEnriching(true);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.title && !newName) setNewName(data.title);
    } catch {
      // Enrichment is best-effort
    } finally {
      setEnriching(false);
    }
  };

  const addBlock = async () => {
    if (!newName.trim()) return;
    setSaving(true);

    const sortOrder = blocks.length;
    const { data, error } = await supabase
      .from('blocks')
      .insert({
        trip_id: tripId,
        name: newName.trim(),
        external_link: newLink.trim() || null,
        cost: newCost ? parseFloat(newCost) : null,
        cost_type: newCostType,
        tag_label: newTag.trim() || null,
        tag_emoji: newEmoji,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (!error && data) {
      const updated = [...blocks, data as Block];
      setBlocks(updated);
      onBlocksChange(updated);
      setNewName('');
      setNewLink('');
      setNewCost('');
      setNewTag('');
      setNewEmoji('📍');
      setShowAdd(false);
    }
    setSaving(false);
  };

  const deleteBlock = async (blockId: string) => {
    await supabase.from('blocks').delete().eq('id', blockId);
    const updated = blocks.filter((b) => b.id !== blockId);
    setBlocks(updated);
    onBlocksChange(updated);
  };

  const moveBlock = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    // Update sort orders
    updated.forEach((b, i) => (b.sort_order = i));
    setBlocks(updated);
    onBlocksChange(updated);

    // Persist reorder
    for (const b of updated) {
      await supabase.from('blocks').update({ sort_order: b.sort_order }).eq('id', b.id);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.1)',
    background: '#fff',
    color: '#1a3a4a',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a3a4a' }}>Blocks</div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: 'none',
            background: showAdd ? '#f0f0f0' : '#2d6b5a',
            color: showAdd ? '#888' : '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showAdd ? 'Cancel' : '+ Add block'}
        </button>
      </div>

      {/* Block list */}
      {blocks.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 13 }}>
          No blocks yet. Add accommodation, flights, activities...
        </div>
      )}

      {blocks.map((block, i) => (
        <div
          key={block.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderBottom: i < blocks.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button
              onClick={() => moveBlock(i, -1)}
              disabled={i === 0}
              style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', fontSize: 10, color: i === 0 ? '#ddd' : '#888', padding: 0 }}
            >
              ▲
            </button>
            <button
              onClick={() => moveBlock(i, 1)}
              disabled={i === blocks.length - 1}
              style={{ background: 'none', border: 'none', cursor: i === blocks.length - 1 ? 'default' : 'pointer', fontSize: 10, color: i === blocks.length - 1 ? '#ddd' : '#888', padding: 0 }}
            >
              ▼
            </button>
          </div>
          <span style={{ fontSize: 16 }}>{block.tag_emoji || '📍'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a3a4a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {block.name}
            </div>
            <div style={{ fontSize: 11, color: '#aaa' }}>
              {block.tag_label || 'No tag'} • {block.cost_type === 'shared' ? 'Split' : 'Individual'}
              {block.cost != null && ` • $${block.cost}`}
            </div>
          </div>
          <button
            onClick={() => deleteBlock(block.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ccc', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add block form */}
      {showAdd && (
        <div style={{ marginTop: 12, padding: 14, background: '#faf9f7', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a3a4a' }}>New block</div>

          <input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onBlur={() => enrichLink(newLink)}
            placeholder="Paste a link (optional — auto-fills title)"
            style={inputStyle}
          />
          {enriching && <div style={{ fontSize: 11, color: '#2d6b5a' }}>Fetching link details...</div>}

          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Block name *" style={inputStyle} />

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(e.target.value)}
              placeholder="Cost"
              style={{ ...inputStyle, flex: 1 }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              {(['shared', 'individual'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setNewCostType(ct)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: newCostType === ct ? '2px solid #2d6b5a' : '1px solid rgba(0,0,0,0.1)',
                    background: newCostType === ct ? '#e0f0eb' : '#fff',
                    color: newCostType === ct ? '#2d6b5a' : '#888',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ct === 'shared' ? 'Split' : 'Individual'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Tag (e.g. Flights)" style={{ ...inputStyle, flex: 1 }} />
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 140 }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: newEmoji === e ? '2px solid #2d6b5a' : '1px solid transparent',
                    background: newEmoji === e ? '#e0f0eb' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addBlock}
            disabled={!newName.trim() || saving}
            style={{
              padding: 12,
              borderRadius: 10,
              border: 'none',
              background: newName.trim() ? '#2d6b5a' : '#e0e0e0',
              color: newName.trim() ? '#fff' : '#aaa',
              fontSize: 13,
              fontWeight: 700,
              cursor: newName.trim() ? 'pointer' : 'default',
            }}
          >
            {saving ? 'Adding...' : 'Add block'}
          </button>
        </div>
      )}
    </div>
  );
}
