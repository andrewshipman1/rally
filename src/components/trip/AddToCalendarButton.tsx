'use client';

import type { Trip } from '@/types';
import type { ThemeId } from '@/lib/themes/types';
import { tripToICS, downloadICS } from '@/lib/calendar';
import { getCopy } from '@/lib/copy/get-copy';

export function AddToCalendarButton({ trip, themeId }: { trip: Trip; themeId: ThemeId }) {
  if (!trip.date_start || !trip.date_end) return null;

  const handleClick = () => {
    const ics = tripToICS(trip);
    if (ics) downloadICS(ics, `rally-${trip.share_slug}`);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Add trip dates to calendar"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--rally-font-body)',
        marginTop: 10,
      }}
    >
      {getCopy(themeId, 'tripPageShared.calendar.cta')}
    </button>
  );
}
