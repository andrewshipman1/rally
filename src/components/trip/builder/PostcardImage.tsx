'use client';

// Small postcard image in the header wordmark row. In sketch phase:
// shows a dashed-border tap target with 📷 when empty, or the uploaded
// image when set. Tap triggers a hidden file input. On select, uploads
// via Supabase Storage and fires onImageChange with the public URL.

import { useRef, useState } from 'react';
import { uploadTripCover } from '@/lib/supabase/upload';

type Props = {
  tripId: string;
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
};

export function PostcardImage({ tripId, imageUrl, onImageChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadTripCover(tripId, file);
    setUploading(false);

    if (url) {
      onImageChange(url);
    }

    // Reset so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        className={`postcard-img${imageUrl ? ' filled' : ''}`}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        aria-label="upload cover image"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="cover" />
        ) : (
          <span className="postcard-placeholder">
            {uploading ? '...' : '📷'}
          </span>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
