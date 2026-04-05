import type { Trip, Block } from '@/types';

/**
 * Generate an .ics calendar file for a trip or individual block.
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
 * Generate .ics for a single block (flight, reservation, etc.)
 */
export function blockToICS(block: Block, trip: Trip): string {
  if (!block.event_datetime) return '';

  const start = formatDate(block.event_datetime);
  // Default 2-hour event
  const endDate = new Date(block.event_datetime);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatDate(endDate.toISOString());

  const description = [
    block.notes,
    block.cost ? `Estimated cost: $${block.cost}` : '',
    block.external_link ? `Link: ${block.external_link}` : '',
  ].filter(Boolean).join('\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rally//Block//EN',
    'BEGIN:VEVENT',
    `UID:${generateUID()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(`${block.tag_emoji || ''} ${block.name}`.trim())}`,
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    block.address ? `LOCATION:${escapeICS(block.address)}` : '',
    `URL:https://rally.app/trip/${trip.share_slug}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return lines.join('\r\n');
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
