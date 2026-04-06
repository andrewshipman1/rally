import type { Activity } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';
import { MapsLink } from './MapsLink';
import { format } from 'date-fns';

export function ActivityCard({ activity }: { activity: Activity }) {
  const dateStr = activity.date ? format(new Date(activity.date), 'EEE, MMM d') : null;

  return (
    <SolidCard style={{ padding: 0, overflow: 'hidden' }}>
      {/* Hero image */}
      {activity.og_image_url && (
        <div
          style={{
            width: '100%',
            height: 140,
            background: `url(${activity.og_image_url}) center/cover`,
          }}
        />
      )}
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
              <Badge text="🤿 Activity" bg="#2d6b5a" color="#fff" />
              <Badge
                text={activity.cost_type === 'shared' ? 'Split' : 'Book yours'}
                bg={activity.cost_type === 'shared' ? '#e0f0eb' : '#e0ebf0'}
                color={activity.cost_type === 'shared' ? '#2d6b5a' : '#1a3a4a'}
              />
              {activity.status === 'confirmed' && (
                <Badge text="Booked" bg="#fff3e0" color="#e65100" />
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
              {activity.name}
            </div>
            {(dateStr || activity.time || activity.duration) && (
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                {[dateStr, activity.time, activity.duration].filter(Boolean).join(' • ')}
              </div>
            )}
            {activity.location && (
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, display: 'flex', alignItems: 'center' }}>
                <span>📍 {activity.location}</span>
                <MapsLink
                  address={activity.location}
                  latitude={activity.latitude}
                  longitude={activity.longitude}
                  size={10}
                />
              </div>
            )}
            {activity.notes && (
              <div style={{ fontSize: 10, color: '#d4a574', marginTop: 3, fontStyle: 'italic' }}>
                {activity.notes}
              </div>
            )}
          </div>
          {activity.estimated_cost != null && (
            <div style={{ textAlign: 'right', marginLeft: 10, flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#2d6b5a',
                  fontFamily: 'var(--rally-font-body)',
                }}
              >
                ~${activity.estimated_cost}
              </div>
              <div style={{ fontSize: 9, color: '#999' }}>
                {activity.cost_type === 'shared' ? 'total, split' : 'per person'}
              </div>
            </div>
          )}
        </div>
        {activity.booking_link && (
          <a
            href={activity.booking_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: 10,
              padding: 7,
              borderRadius: 8,
              border: '1px solid #2d6b5a25',
              color: '#2d6b5a',
              fontSize: 11,
              fontWeight: 600,
              textDecoration: 'none',
              background: '#2d6b5a08',
            }}
          >
            Book →
          </a>
        )}
      </div>
    </SolidCard>
  );
}
