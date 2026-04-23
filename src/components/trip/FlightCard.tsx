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

import type { Flight } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { getCopy } from '@/lib/copy/get-copy';
import { formatMoney } from '@/lib/money';

type Props = {
  flight: Flight;
  themeId: ThemeId;
};

export function FlightCard({ flight, themeId }: Props) {
  const tagLabel = getCopy(themeId, 'tripPageShared.transport.typeLabel.flight');
  const splitLabel = getCopy(themeId, 'tripPageShared.transport.splitIndividual');
  const cost = flight.estimated_price != null
    ? formatMoney(flight.estimated_price)
    : '';

  const body = (
    <>
      <span className="transport-card-icon" aria-hidden>✈️</span>
      <span className="transport-card-body">
        <span className="transport-card-title">
          {flight.departure_airport} → {flight.arrival_airport}
        </span>
        <span className="transport-card-meta">
          {cost && <>{cost} · </>}
          <span className="split">{splitLabel}</span>
          {' · '}
          {tagLabel}
        </span>
      </span>
    </>
  );

  if (flight.booking_link) {
    return (
      <a
        className="transport-card tappable"
        href={flight.booking_link}
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
