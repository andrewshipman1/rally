import type { Restaurant } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { MapsLink } from './MapsLink';
import { format } from 'date-fns';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const dateStr = restaurant.date ? format(new Date(restaurant.date), 'EEE, MMM d') : null;
  const timeStr = restaurant.time;

  return (
    <SolidCard style={{ padding: 0, display: 'flex', alignItems: 'stretch' }}>
      {/* Thumbnail */}
      {restaurant.og_image_url ? (
        <div
          style={{
            width: 90,
            flexShrink: 0,
            background: `url(${restaurant.og_image_url}) center/cover`,
          }}
        />
      ) : (
        <div
          style={{
            width: 90,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #8b6f5c, #6b4c3b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🍽️
        </div>
      )}
      <div style={{ flex: 1, padding: 14, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
          <Badge text="🍽️ Meals" bg="#8b6f5c" color="#fff" />
          {restaurant.status === 'confirmed' && (
            <Badge text="Reserved" bg="#e0f0eb" color="#2d6b5a" />
          )}
        </div>
        <div
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: '#1a3a4a',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {restaurant.name}
        </div>
        {(dateStr || timeStr) && (
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
            {[dateStr, timeStr].filter(Boolean).join(' • ')}
          </div>
        )}
        {restaurant.address && (
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center' }}>
            <span>📍 {restaurant.address}</span>
            <MapsLink
              address={restaurant.address}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              size={10}
            />
          </div>
        )}
        {restaurant.cost_per_person != null && (
          <div style={{ fontSize: 11, color: '#2d6b5a', fontWeight: 700, marginTop: 4 }}>
            ~${restaurant.cost_per_person}/person
          </div>
        )}
      </div>
    </SolidCard>
  );
}
