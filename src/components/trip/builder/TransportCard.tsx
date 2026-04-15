'use client';

// Session 8M — Sketch-phase TransportCard.
//
// Compact single-line card per wireframe Frame 2:
//   28px icon · 1fr body (title + meta) · auto link-chip
//
// NO hero image on the card — enrichment lives only in the drawer.
// Whole card is the tap target → opens drawer in edit mode.
//
// The legacy `src/components/trip/TransportCard.tsx` continues to
// render on the non-sketch trip page (sell/lock/go) and is intentionally
// untouched.

import type { Transport, TransportTypeTag } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { getCopy } from '@/lib/copy/get-copy';

const TAG_EMOJI: Record<TransportTypeTag, string> = {
  flight: '✈️',
  train: '🚆',
  rental_car_van: '🚗',
  charter_van_bus: '🚐',
  charter_boat: '⛵',
  ferry: '⛴',
  other: '·',
};

const TAG_COPY_KEY: Record<TransportTypeTag, string> = {
  flight: 'flight',
  train: 'train',
  rental_car_van: 'rentalCarVan',
  charter_van_bus: 'charterVanBus',
  charter_boat: 'charterBoat',
  ferry: 'ferry',
  other: 'other',
};

type Props = {
  transport: Transport;
  themeId: ThemeId;
  onEdit: (transport: Transport) => void;
};

export function TransportCard({ transport, themeId, onEdit }: Props) {
  const tag = transport.type_tag;
  const emoji = TAG_EMOJI[tag] ?? '·';
  const tagLabel = getCopy(themeId, `builderState.transport.tagLabel.${TAG_COPY_KEY[tag]}`);
  const splitLabel = getCopy(
    themeId,
    transport.cost_type === 'shared'
      ? 'builderState.transport.splitGroup'
      : 'builderState.transport.splitIndividual',
  );
  const cost = transport.estimated_total != null
    ? `$${Math.round(transport.estimated_total)}`
    : '';
  const meta = [cost, splitLabel, tagLabel].filter(Boolean).join(' · ');
  const hasLink = !!transport.booking_link;

  return (
    <button
      type="button"
      className="transport-card"
      onClick={() => onEdit(transport)}
      aria-label={`edit ${transport.description}`}
    >
      <span className="transport-card-icon" aria-hidden>{emoji}</span>
      <span className="transport-card-body">
        <span className="transport-card-title">{transport.description}</span>
        <span className="transport-card-meta">{meta}</span>
      </span>
      {hasLink && (
        <span className="transport-card-link-chip" aria-hidden>↗</span>
      )}
    </button>
  );
}
