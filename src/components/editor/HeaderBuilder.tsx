'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { HeaderImage } from '@/types';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'rally-images';
const MAX_PHOTOS = 5;

// Default grid positions for the 5 collage tiles (matches CollageHeader)
const POSITIONS = ['1/3 / 1/2', '1/2 / 2/3', '2/3 / 2/3', '3/4 / 1/3', '1/4 / 3/4'];

export function HeaderBuilder({
  tripId,
  headerImages,
  onChange,
}: {
  tripId: string;
  headerImages: HeaderImage[];
  onChange: (images: HeaderImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persist = async (images: HeaderImage[]) => {
    await supabase.from('trips').update({ header_images: images }).eq('id', tripId);
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError('');
    setUploading(true);

    const next = [...headerImages];
    try {
      for (const file of Array.from(files)) {
        if (next.length >= MAX_PHOTOS) break;
        if (!file.type.startsWith('image/')) continue;

        const ext = file.name.split('.').pop() || 'jpg';
        const path = `trips/${tripId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadErr) throw uploadErr;

        const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
        next.push({
          url: publicUrl.publicUrl,
          position: POSITIONS[next.length] || POSITIONS[0],
          label: file.name.replace(/\.[^.]+$/, ''),
        });
      }
      onChange(next);
      await persist(next);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(
        msg.includes('not found') || msg.includes('Bucket')
          ? `Storage bucket "${BUCKET}" not found. Create it in Supabase Dashboard → Storage (public).`
          : msg
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const remove = async (index: number) => {
    const updated = headerImages.filter((_, i) => i !== index);
    // Reassign positions in order
    const reindexed = updated.map((img, i) => ({
      ...img,
      position: POSITIONS[i] || POSITIONS[0],
    }));
    onChange(reindexed);
    await persist(reindexed);
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
          }}
        >
          📸 Header collage
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
          {headerImages.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 12, lineHeight: 1.4 }}>
        Add up to {MAX_PHOTOS} photos that show what the trip is about
      </div>

      {/* Photo grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          marginBottom: 12,
        }}
      >
        {headerImages.map((img, i) => (
          <div
            key={img.url}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: 8,
              overflow: 'hidden',
              background: `url(${img.url}) center/cover`,
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <button
              onClick={() => remove(i)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: '#fff',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Upload tile */}
        {headerImages.length < MAX_PHOTOS && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: '1',
              borderRadius: 8,
              border: '1px dashed rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.6)',
              cursor: uploading ? 'wait' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              fontSize: 11,
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 22 }}>{uploading ? '⏳' : '+'}</span>
            <span>{uploading ? 'Uploading...' : 'Add photo'}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => upload(e.target.files)}
        style={{ display: 'none' }}
      />

      {error && (
        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(255,100,100,0.15)',
            color: '#ffb3b3',
            fontSize: 11,
            borderRadius: 8,
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
