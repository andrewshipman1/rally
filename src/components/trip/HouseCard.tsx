'use client';

import { useState, useEffect } from 'react';
import type { Block } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';

// Default house image placeholders
const DEFAULT_IMAGES = [
  { color: '#3a8a7a', label: 'Pool & Ocean View' },
  { color: '#2d6b5a', label: 'Open-Air Living' },
  { color: '#c4956a', label: 'Master Suite' },
  { color: '#1a3d4a', label: 'Rooftop Terrace' },
];

export function HouseCard({
  block,
  confirmedCount,
}: {
  block: Block;
  confirmedCount: number;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const images: { url: string | null; label: string; color: string }[] =
    block.image_urls && block.image_urls.length > 0
      ? block.image_urls.map((url, i) => ({
          url,
          label: DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]?.label || '',
          color: DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]?.color || '#3a8a7a',
        }))
      : DEFAULT_IMAGES.map((d) => ({ url: null, ...d }));

  useEffect(() => {
    const timer = setInterval(() => setImgIdx((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const ppn = block.cost ? Math.round(block.cost / (confirmedCount || 1)) : null;

  // Parse house tags from notes or use defaults
  const tags = ['Private pool', 'Beachfront', '6 BR', 'Chef kitchen'];

  return (
    <SolidCard>
      {/* Image carousel */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '100%',
            height: 200,
            background: images[imgIdx]?.url
              ? `url(${images[imgIdx].url}) center/cover`
              : images[imgIdx]?.color || '#3a8a7a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background .5s',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,.1) 0%, transparent 50%)',
            }}
          />
          {!images[imgIdx]?.url && (
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--rally-font-body)' }}>
              📷 {images[imgIdx]?.label}
            </span>
          )}
          {/* Arrows */}
          {[-1, 1].map((d) => (
            <button
              key={d}
              onClick={() => setImgIdx((i) => (i + d + images.length) % images.length)}
              style={{
                position: 'absolute',
                [d < 0 ? 'left' : 'right']: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,.25)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              {d < 0 ? '‹' : '›'}
            </button>
          ))}
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', padding: '8px 0 0' }}>
          {images.map((_, i) => (
            <div
              key={i}
              onClick={() => setImgIdx(i)}
              style={{
                width: i === imgIdx ? 16 : 5,
                height: 5,
                borderRadius: 3,
                background: i === imgIdx ? '#d4a574' : '#ccc',
                transition: 'all .3s',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
          <Badge text={`${block.tag_emoji || '🏠'} ${block.tag_label || 'The House'}`} bg="#2d6b5a" color="#fff" />
          {ppn && (
            <span style={{ fontSize: 10, color: '#d4a574', fontWeight: 600 }}>
              ~${ppn}/night • Split
            </span>
          )}
        </div>
        <h3
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 16,
            color: '#1a3a4a',
            margin: '0 0 2px',
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {block.name}
        </h3>
        {block.address && (
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px' }}>📍 {block.address}</p>
        )}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 10,
                color: '#1a3a4a',
                background: '#f0ebe5',
                padding: '3px 8px',
                borderRadius: 14,
                fontWeight: 500,
              }}
            >
              {t}
            </span>
          ))}
        </div>
        {block.external_link && (
          <a
            href={block.external_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: 8,
              borderRadius: 10,
              border: '1.5px solid #2d6b5a',
              color: '#2d6b5a',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all .2s',
            }}
          >
            View full listing →
          </a>
        )}
      </div>
    </SolidCard>
  );
}
