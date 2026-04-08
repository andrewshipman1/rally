// LodgingGallery — replaces the old LodgingCarousel.
//
// Per kickoff: lodging is a "gallery, not card" — multiple house cards
// rendered in a vertical stack (or 2-column grid on wider screens).
// Each card uses the chassis .house primitive. Voting state is read-only
// in Session 1; the full voting interaction is rebuilt in Session 3.
//
// The smart-link image rule applies: tapping a card opens the listing URL.

import Image from 'next/image';
import type { Lodging } from '@/types';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  lodging: Lodging[];
};

export function LodgingGallery({ themeId, lodging }: Props) {
  if (lodging.length === 0) {
    return (
      <div className="lodging-gallery">
        <h2 className="section-h2">{getCopy(themeId, 'tripPageShared.lodging.h2')}</h2>
        <div className="lodging-empty">{getCopy(themeId, 'lodgingVoting.empty')}</div>
      </div>
    );
  }

  return (
    <section className="lodging-gallery">
      <h2 className="section-h2">{getCopy(themeId, 'tripPageShared.lodging.h2')}</h2>
      <div className="lodging-gallery-grid">
        {lodging.map((spot) => {
          const href = spot.link || '#';
          const meta =
            spot.cost_per_night
              ? `$${spot.cost_per_night}/night`
              : spot.address ?? null;
          return (
            <a
              key={spot.id}
              href={href}
              target={spot.link ? '_blank' : undefined}
              rel={spot.link ? 'noopener noreferrer' : undefined}
              className="house"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              <div className="house-img" style={{ position: 'relative' }}>
                {spot.is_selected && <div className="house-flag">🗝️ the spot</div>}
                {spot.og_image_url && (
                  <Image
                    src={spot.og_image_url}
                    alt={spot.name}
                    fill
                    sizes="(max-width: 420px) 100vw, 200px"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                )}
              </div>
              <div className="house-body">
                <div className="house-title">{spot.name}</div>
                {meta && <div className="house-meta">{meta}</div>}
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
