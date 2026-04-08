// Single source of truth for the sketch → sell CTA ungate rule.
//
// A sketch trip is "ready to send" when:
//   1. The name is at least 3 non-whitespace characters.
//   2. At least one of date_start / date_end is set.
//   3. At least one member other than the organizer exists.
//
// Both the server (initial render) and the client (optimistic on each
// keystroke) derive the same answer from this function. The client
// cannot re-evaluate the crew check without a round-trip, so the
// builder shell splits this into two booleans — see SketchTripShell.
import type { TripWithDetails } from '@/types';

export function isSketchReady(trip: TripWithDetails): boolean {
  return (
    hasReadyName(trip.name) &&
    hasReadyDate(trip.date_start, trip.date_end) &&
    hasNonOrganizerMember(trip.members ?? [], trip.organizer_id)
  );
}

export function hasReadyName(name: string | null | undefined): boolean {
  return (name ?? '').trim().length >= 3;
}

export function hasReadyDate(
  dateStart: string | null | undefined,
  dateEnd: string | null | undefined,
): boolean {
  return !!(dateStart || dateEnd);
}

export function hasNonOrganizerMember(
  members: Array<{ user_id: string }>,
  organizerId: string,
): boolean {
  return members.some((m) => m.user_id !== organizerId);
}
