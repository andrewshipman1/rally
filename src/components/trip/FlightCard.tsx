import type { Flight } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/lib/money';
import { getCopy } from '@/lib/copy/get-copy';

export function FlightCard({ flight, themeId }: { flight: Flight; themeId: ThemeId }) {
  return (
    <SolidCard style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
            <Badge text="✈️ Flights" bg="#1a3d4a" color="#fff" />
            <Badge text="Book yours" bg="#e0ebf0" color="#1a3a4a" />
            {flight.status === 'confirmed' && <Badge text="Confirmed" bg="#e0f0eb" color="#2d6b5a" />}
          </div>
          <div
            style={{
              fontFamily: 'var(--rally-font-display)',
              fontSize: 17,
              fontWeight: 700,
              color: '#1a3a4a',
              lineHeight: 1.3,
            }}
          >
            {flight.departure_airport} → {flight.arrival_airport}
          </div>
          {(flight.airline || flight.duration || flight.is_direct !== null) && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              {[
                flight.airline,
                flight.is_direct === true ? 'Direct' : flight.is_direct === false ? 'Connecting' : null,
                flight.duration,
              ]
                .filter(Boolean)
                .join(' • ')}
            </div>
          )}
          {flight.flight_number && (
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {flight.flight_number}
            </div>
          )}
          {flight.notes && (
            <div style={{ fontSize: 10, color: '#d4a574', marginTop: 3, fontStyle: 'italic' }}>
              {flight.notes}
            </div>
          )}
        </div>
        {flight.estimated_price != null && (
          <div style={{ textAlign: 'right', marginLeft: 10, flexShrink: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#2d6b5a',
                fontFamily: 'var(--rally-font-body)',
              }}
            >
              {'~'}{formatMoney(flight.estimated_price)}
            </div>
            <div style={{ fontSize: 9, color: '#999' }}>{getCopy(themeId, 'tripPageShared.flight.perPerson')}</div>
          </div>
        )}
      </div>
      {flight.booking_link && (
        <a
          href={flight.booking_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            padding: 7,
            borderRadius: 8,
            border: '1px solid #1a3d4a25',
            color: '#1a3d4a',
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            background: '#1a3d4a08',
          }}
        >
          {getCopy(themeId, 'tripPageShared.flight.searchCta')}
        </a>
      )}
    </SolidCard>
  );
}
