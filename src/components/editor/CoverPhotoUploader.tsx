'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = 'rally-images';

export function CoverPhotoUploader({
  tripId,
  coverImageUrl,
  onChange,
}: {
  tripId: string;
  coverImageUrl: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persist = async (url: string | null) => {
    await supabase.from('trips').update({ cover_image_url: url }).eq('id', tripId);
  };

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `trips/${tripId}/cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadErr) throw uploadErr;

      const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const url = publicUrl.publicUrl;
      onChange(url);
      await persist(url);
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

  const remove = async () => {
    onChange(null);
    await persist(null);
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
        📸 Cover photo
      </div>

      {coverImageUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 300,
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)',
            backgroundImage: `url(${coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              display: 'flex',
              gap: 8,
            }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: uploading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            <button
              onClick={remove}
              disabled={uploading}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Remove cover photo"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%',
            height: 300,
            borderRadius: 18,
            border: '1px dashed rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.7)',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontFamily: 'inherit',
          }}
        >
          <span style={{ fontSize: 36 }}>{uploading ? '⏳' : '📷'}</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {uploading ? 'Uploading…' : 'Add a cover photo'}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            Full-bleed, looks best wide
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => upload(e.target.files)}
        style={{ display: 'none' }}
      />

      {error && (
        <div
          style={{
            marginTop: 12,
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
