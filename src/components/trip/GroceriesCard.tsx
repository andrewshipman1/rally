import type { Grocery } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { MapsLink } from './MapsLink';
import { formatMoney } from '@/lib/money';

export function GroceriesCard({ grocery }: { grocery: Grocery }) {
  return (
    <SolidCard style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
              <Badge text="🛒 Groceries" bg="#2d6b5a" color="#fff" />
              <Badge
                text={grocery.cost_type === 'shared' ? 'Split' : 'Individual'}
                bg={grocery.cost_type === 'shared' ? '#e0f0eb' : '#e0ebf0'}
                color={grocery.cost_type === 'shared' ? '#2d6b5a' : '#1a3a4a'}
              />
              {grocery.status === 'confirmed' && (
                <Badge text="Confirmed" bg="#fff3e0" color="#e65100" />
              )}
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
              {grocery.name}
            </div>
            {grocery.store_name && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {grocery.store_name}
              </div>
            )}
            {grocery.store_address && (
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center' }}>
                <span>{'📍 '}{grocery.store_address}</span>
                <MapsLink
                  address={grocery.store_address}
                  latitude={grocery.latitude}
                  longitude={grocery.longitude}
                  size={10}
                />
              </div>
            )}
            {grocery.notes && (
              <div style={{ fontSize: 10, color: '#d4a574', marginTop: 3, fontStyle: 'italic' }}>
                {grocery.notes}
              </div>
            )}
          </div>
          {grocery.estimated_total != null && (
            <div style={{ textAlign: 'right', marginLeft: 10, flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#2d6b5a',
                  fontFamily: 'var(--rally-font-body)',
                }}
              >
                {'~'}{formatMoney(grocery.estimated_total)}
              </div>
              <div style={{ fontSize: 9, color: '#999' }}>
                {grocery.cost_type === 'shared' ? 'total, split' : 'per person'}
              </div>
            </div>
          )}
        </div>
      </div>
    </SolidCard>
  );
}
