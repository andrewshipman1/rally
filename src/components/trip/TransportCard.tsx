import type { Transport } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { formatMoney } from '@/lib/money';

const SUBTYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  car_rental: { label: 'Car Rental', emoji: '🚗' },
  taxi: { label: 'Taxi', emoji: '🚕' },
  public_transit: { label: 'Public Transit', emoji: '🚇' },
};

export function TransportCard({
  transport,
  memberCount = 0,
}: {
  transport: Transport;
  memberCount?: number;
}) {
  const meta = SUBTYPE_LABELS[transport.subtype] || { label: 'Transport', emoji: '🚗' };
  const costType = transport.cost_type;
  const splitWays = Math.max(memberCount, 1);
  const total = transport.estimated_total;
  const perPerson =
    costType === 'shared' && total != null ? total / splitWays : total;

  return (
    <SolidCard style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            background:
              'linear-gradient(135deg, rgba(107,76,59,0.12), rgba(212,165,116,0.18))',
            border: '1px solid rgba(107,76,59,0.18)',
          }}
          aria-hidden
        >
          {meta.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 3,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--rally-font-display)',
                fontSize: 17,
                fontWeight: 800,
                color: '#1a3a4a',
                lineHeight: 1.2,
              }}
            >
              {meta.label}
            </div>
            <Badge
              text={costType === 'shared' ? 'Split' : 'Individual'}
              bg={costType === 'shared' ? '#e0f0eb' : '#e0ebf0'}
              color={costType === 'shared' ? '#2d6b5a' : '#1a3a4a'}
            />
          </div>

          {(transport.provider || transport.vehicle_type) && (
            <div
              style={{
                fontSize: 12,
                color: '#6b4c3b',
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              {[transport.provider, transport.vehicle_type].filter(Boolean).join(' • ')}
            </div>
          )}

          {transport.route && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{transport.route}</div>
          )}

          {transport.daily_rate && transport.num_days && (
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
              {formatMoney(transport.daily_rate, '/day')} × {transport.num_days} days
            </div>
          )}

          {transport.notes && (
            <div style={{ fontSize: 10, color: '#d4a574', marginTop: 3, fontStyle: 'italic' }}>
              {transport.notes}
            </div>
          )}
        </div>
      </div>

      {total != null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid rgba(107,76,59,0.12)',
          }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>
            {costType === 'shared'
              ? `Split ${splitWays} way${splitWays === 1 ? '' : 's'}`
              : 'Per person'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#2d6b5a',
                fontFamily: 'var(--rally-font-body)',
                lineHeight: 1,
              }}
            >
              {formatMoney(perPerson ?? 0)}
            </div>
            {costType === 'shared' && (
              <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>
                {formatMoney(total)} total
              </div>
            )}
          </div>
        </div>
      )}

      {transport.booking_link && (
        <a
          href={transport.booking_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            padding: 8,
            borderRadius: 8,
            border: '1px solid #6b4c3b25',
            color: '#6b4c3b',
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            background: '#6b4c3b08',
          }}
        >
          Check rates →
        </a>
      )}
    </SolidCard>
  );
}
