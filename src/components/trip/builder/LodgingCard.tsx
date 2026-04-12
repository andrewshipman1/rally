'use client';

// LodgingCard — .house-style card for a lodging option in sketch phase.
// Reuses the existing .house CSS pattern from LodgingGallery (sell phase).
// Session 8A + 8B (getCopy cleanup, edit flow, crew-aware hotel cost).

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging } from '@/types';
import { removeLodgingOption } from '@/app/actions/sketch-modules';

type Props = {
  spot: Lodging;
  themeId: ThemeId;
  tripId: string;
  slug: string;
  dateStart: string | null;
  dateEnd: string | null;
  onEdit?: (spot: Lodging) => void;
  crewCount?: number;
};

function computeNights(dateStart: string | null, dateEnd: string | null): number | null {
  if (!dateStart || !dateEnd) return null;
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

function truncateUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 20 ? u.pathname.slice(0, 20) + '...' : u.pathname;
    return u.hostname + path;
  } catch {
    return url.length > 40 ? url.slice(0, 40) + '...' : url;
  }
}

export function LodgingCard({ spot, themeId, tripId, slug, dateStart, dateEnd, onEdit, crewCount }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await removeLodgingOption(tripId, slug, spot.id);
      router.refresh();
    });
  };

  const handleEdit = () => {
    if (onEdit) onEdit(spot);
  };

  const nights = computeNights(dateStart, dateEnd);
  const imageUrl = spot.og_image_url;

  // Emoji + type name via getCopy
  const emojiKey = spot.accommodation_type === 'home_rental' ? 'lodging.emojiHomeRental'
    : spot.accommodation_type === 'hotel' ? 'lodging.emojiHotel'
    : 'lodging.emojiOther';
  const typeNameKey = spot.accommodation_type === 'home_rental' ? 'lodging.typeHomeRental'
    : spot.accommodation_type === 'hotel' ? 'lodging.typeHotel'
    : 'lodging.typeOther';
  const typeBadge = `${getCopy(themeId, `builderState.${emojiKey}`)} ${getCopy(themeId, `builderState.${typeNameKey}`)}`;

  // Cost display varies by type
  let costLine: string | null = null;
  if (spot.accommodation_type === 'home_rental') {
    if (spot.total_cost != null && spot.total_cost > 0) {
      costLine = `$${spot.total_cost.toLocaleString()} ${getCopy(themeId, 'builderState.lodging.totalLabel')}`;
    }
  } else if (spot.accommodation_type === 'hotel') {
    if (spot.cost_per_night != null) {
      const perRoom = spot.people_per_room || 1;
      const rooms = crewCount ? Math.ceil(crewCount / perRoom) : 1;
      const times = getCopy(themeId, 'builderState.lodging.timesSymbol');
      const eq = getCopy(themeId, 'builderState.lodging.equalsSymbol');
      const approx = getCopy(themeId, 'builderState.lodging.approxSymbol');
      if (nights) {
        const estimate = Math.round(spot.cost_per_night * nights * rooms);
        const roomsPart = rooms > 1 ? ` ${times} ${rooms} ${getCopy(themeId, 'builderState.lodging.roomsLabel')}` : '';
        costLine = `$${spot.cost_per_night}${getCopy(themeId, 'builderState.lodging.perNightLabel')} ${times} ${nights} ${getCopy(themeId, 'builderState.lodging.nightsLabel')}${roomsPart} ${eq} ${approx}$${estimate.toLocaleString()}`;
      } else {
        costLine = `$${spot.cost_per_night}${getCopy(themeId, 'builderState.lodging.perNightLabel')}`;
      }
    }
  } else {
    // Other
    if (spot.total_cost != null && spot.total_cost > 0) {
      costLine = `$${spot.total_cost.toLocaleString()} ${getCopy(themeId, 'builderState.lodging.totalLabel')}`;
    } else {
      costLine = getCopy(themeId, 'builderState.lodging.freeLabel');
    }
  }

  // Meta line
  let metaParts: string[] = [];
  if (spot.accommodation_type === 'home_rental') {
    if (spot.bedrooms) metaParts.push(`${spot.bedrooms} ${getCopy(themeId, 'builderState.lodging.bedroomsLabel')}`);
    if (spot.max_guests) metaParts.push(`${spot.max_guests} ${getCopy(themeId, 'builderState.lodging.maxGuestsLabel')}`);
  } else if (spot.accommodation_type === 'hotel' && spot.people_per_room) {
    metaParts.push(`${spot.people_per_room} ${getCopy(themeId, 'builderState.lodging.perRoomLabel')}`);
  }
  const metaLine = metaParts.length > 0 ? metaParts.join(getCopy(themeId, 'builderState.lodging.separatorDot')) : null;

  return (
    <div
      className="house lodging-card"
      style={{ opacity: pending ? 0.5 : 1, cursor: onEdit ? 'pointer' : 'default' }}
      onClick={handleEdit}
    >
      {/* Image header */}
      <div className="house-img" style={{ position: 'relative' }}>
        {/* Type badge */}
        <div className="house-flag lodging-type-badge">{typeBadge}</div>
        {/* Remove button */}
        <button
          className="lodging-remove-btn"
          onClick={handleRemove}
          disabled={pending}
          type="button"
          aria-label={`Remove ${spot.name}`}
        >
          {getCopy(themeId, 'builderState.lodging.closeSymbol')}
        </button>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Photo of ${spot.name}`}
            fill
            sizes="(max-width: 420px) 100vw, 400px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div className="lodging-img-placeholder">
            {getCopy(themeId, `builderState.${emojiKey}`)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="house-body">
        <div className="house-title">{spot.name}</div>
        {costLine && <div className="house-meta">{costLine}</div>}
        {metaLine && <div className="lodging-card-meta">{metaLine}</div>}

        {/* Prominent link */}
        {spot.link && (
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="lodging-link-pill"
            onClick={(e) => e.stopPropagation()}
          >
            {getCopy(themeId, 'builderState.lodging.viewListing')}
          </a>
        )}
      </div>
    </div>
  );
}
