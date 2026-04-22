// ─────────────────────────────────────────────────────────────
// 9K intentional duplication — SEE ALSO: the sibling file.
// This component and its sibling (TransportCard ↔ FlightCard)
// share the compact-card JSX shape by design. We chose
// duplication over extracting a <CompactLineCard> primitive
// because flights[] → transport[type_tag='flight'] data-model
// collapse is tracked as future work; when it lands,
// FlightCard.tsx is deleted and no primitive survives.
//
// Revisit if any of these trigger:
//   (a) bug appears in one file but not the other (drift)
//   (b) a third caller wants the compact shape
//   (c) the data-model collapse session gets scheduled
// ─────────────────────────────────────────────────────────────

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
};

export function TransportCard({ transport, themeId }: Props) {
  const tag: TransportTypeTag = transport.type_tag ?? 'other';
  const emoji = TAG_EMOJI[tag] ?? '·';
  const tagLabel = getCopy(themeId, `tripPageShared.transport.typeLabel.${TAG_COPY_KEY[tag]}`);
  const splitLabel = getCopy(
    themeId,
    transport.cost_type === 'shared'
      ? 'tripPageShared.transport.splitGroup'
      : 'tripPageShared.transport.splitIndividual',
  );
  const cost = transport.estimated_total != null
    ? `$${Math.round(transport.estimated_total)}`
    : '';

  const body = (
    <>
      <span className="transport-card-icon" aria-hidden>{emoji}</span>
      <span className="transport-card-body">
        <span className="transport-card-title">{transport.description}</span>
        <span className="transport-card-meta">
          {cost && <>{cost} · </>}
          <span className="split">{splitLabel}</span>
          {' · '}
          {tagLabel}
        </span>
      </span>
    </>
  );

  if (transport.booking_link) {
    return (
      <a
        className="transport-card tappable"
        href={transport.booking_link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
        <span className="transport-card-link-chip" aria-hidden>↗</span>
      </a>
    );
  }

  return <div className="transport-card">{body}</div>;
}
