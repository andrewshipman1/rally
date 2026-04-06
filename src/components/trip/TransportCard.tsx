import type { Transport } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';

const SUBTYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  car_rental: { label: 'Rental Car', emoji: '🚗' },
  taxi: { label: 'Taxi / Uber', emoji: '🚕' },
  public_transit: { label: 'Public Transit', emoji: '🚆' },
};

export function TransportCard({ transport }: { transport: Transport }) {
  const meta = SUBTYPE_LABELS[transport.subtype] || { label: 'Transport', emoji: '🚗' };
  const costType = transport.cost_type;

  return (
    <SolidCard style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
            <Badge text={`${meta.emoji} ${meta.label}`} bg="#6b4c3b" color="#fff" />
            <Badge
              text={costType === 'shared' ? 'Split' : 'Individual'}
              bg={costType === 'shared' ? '#e0f0eb' : '#e0ebf0'}
              color={costType === 'shared' ? '#2d6b5a' : '#1a3a4a'}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--rally-font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: '#1a3a4a',
              lineHeight: 1.3,
            }}
          >
            {[transport.provider, transport.vehicle_type].filter(Boolean).join(' • ') || meta.label}
          </div>
          {transport.route && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{transport.route}</div>
          )}
          {transport.daily_rate && transport.num_days && (
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
              ${transport.daily_rate}/day × {transport.num_days} days
            </div>
          )}
          {transport.notes && (
            <div style={{ fontSize: 10, color: '#d4a574', marginTop: 3, fontStyle: 'italic' }}>
              {transport.notes}
            </div>
          )}
        </div>
        {transport.estimated_total != null && (
          <div style={{ textAlign: 'right', marginLeft: 10, flexShrink: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#2d6b5a',
                fontFamily: 'var(--rally-font-body)',
              }}
            >
              ~${transport.estimated_total}
            </div>
            <div style={{ fontSize: 9, color: '#999' }}>
              {costType === 'shared' ? 'total, split' : 'per person'}
            </div>
          </div>
        )}
      </div>
      {transport.booking_link && (
        <a
          href={transport.booking_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            padding: 7,
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
