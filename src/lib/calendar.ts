import type { Trip, Flight, Activity, Restaurant } from '@/types';

/**
 * Generate an .ics calendar file for a trip or individual component.
 */

function formatDate(date: string): string {
  // Convert to YYYYMMDDTHHMMSSZ format
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@rally.app`;
}

/**
 * Generate .ics for the entire trip (date range)
 */
export function tripToICS(trip: Trip): string {
  if (!trip.date_start || !trip.date_end) return '';

  const start = formatDate(trip.date_start + 'T00:00:00Z');
  const end = formatDate(trip.date_end + 'T23:59:59Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rally//Trip//EN',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(trip.name)}${trip.destination ? ` — ${trip.destination}` : ''}`,
    trip.tagline ? `DESCRIPTION:${escapeICS(trip.tagline)}` : '',
    `URL:https://rally.app/trip/${trip.share_slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
}

/**
 * Generate .ics for a flight
 */
export function flightToICS(flight: Flight, trip: Trip): string {
  if (!flight.departure_time) return '';

  const start = formatDate(flight.departure_time);
  const endDate = flight.arrival_time
    ? new Date(flight.arrival_time)
    : (() => {
        const d = new Date(flight.departure_time);
        d.setHours(d.getHours() + 3);
        return d;
      })();
  const end = formatDate(endDate.toISOString());

  const summary = `✈️ ${flight.departure_airport} → ${flight.arrival_airport}`;
  const description = [
    flight.airline,
    flight.flight_number,
    flight.estimated_price ? `Estimated: $${flight.estimated_price}` : '',
    flight.notes,
  ]
    .filter(Boolean)
    .join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rally//Flight//EN',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(summary)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    `URL:https://rally.app/trip/${trip.share_slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Generate .ics for an activity
 */
export function activityToICS(activity: Activity, trip: Trip): string {
  if (!activity.date) return '';

  const startIso = activity.time
    ? `${activity.date}T${parseTime(activity.time)}:00Z`
    : `${activity.date}T09:00:00Z`;
  const start = formatDate(startIso);
  const endDate = new Date(startIso);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatDate(endDate.toISOString());

  const description = [
    activity.notes,
    activity.estimated_cost ? `Estimated cost: $${activity.estimated_cost}` : '',
    activity.booking_link ? `Link: ${activity.booking_link}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rally//Activity//EN',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(`🤿 ${activity.name}`)}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    activity.location ? `LOCATION:${escapeICS(activity.location)}` : '',
    `URL:https://rally.app/trip/${trip.share_slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Generate .ics for a restaurant reservation
 */
export function restaurantToICS(restaurant: Restaurant, trip: Trip): string {
  if (!restaurant.date) return '';

  const startIso = restaurant.time
    ? `${restaurant.date}T${parseTime(restaurant.time)}:00Z`
    : `${restaurant.date}T19:00:00Z`;
  const start = formatDate(startIso);
  const endDate = new Date(startIso);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatDate(endDate.toISOString());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rally//Restaurant//EN',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(`🍽️ ${restaurant.name}`)}`,
    restaurant.notes ? `DESCRIPTION:${escapeICS(restaurant.notes)}` : '',
    restaurant.address ? `LOCATION:${escapeICS(restaurant.address)}` : '',
    `URL:https://rally.app/trip/${trip.share_slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

// Parse "8:00 PM" → "20:00"
function parseTime(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '09:00';
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Trigger download of .ics file in browser
 */
export function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
