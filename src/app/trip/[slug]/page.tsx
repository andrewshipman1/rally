import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getGuestUserId, refreshGuestCookie } from '@/lib/guest-auth';
import { calculateTripCost } from '@/types';
import type { TripWithDetails } from '@/types';
import { format } from 'date-fns';
import { track } from '@/lib/analytics';

import { dbRsvpToRally } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import { getTheme } from '@/lib/themes';
import { getCopy } from '@/lib/copy/get-copy';

// New chassis components
import { PostcardHero } from '@/components/trip/PostcardHero';
import { ChassisCountdown } from '@/components/trip/ChassisCountdown';
import { LodgingGallery } from '@/components/trip/LodgingGallery';
import { StickyRsvpBarChassis } from '@/components/trip/StickyRsvpBarChassis';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { SketchTripShell } from '@/components/trip/builder/SketchTripShell';
import { hasNonOrganizerMember } from '@/lib/builder/ungate';

// Carry-over typed component cards from v0. These get rebuilt against the
// chassis in Session 2/3; for now they render inside the .chassis wrapper
// so the page loads end-to-end. Their inline strings are flagged with
// TODO(session-N) lint disables in Step 6.
import { OrganizerCard } from '@/components/trip/OrganizerCard';
import { Description } from '@/components/trip/Description';
import { ExtrasSections } from '@/components/trip/ExtrasSections';
import { FlightCard } from '@/components/trip/FlightCard';
import { TransportCard } from '@/components/trip/TransportCard';
import { RestaurantCard } from '@/components/trip/RestaurantCard';
import { ActivityCard } from '@/components/trip/ActivityCard';
import { GroceriesCard } from '@/components/trip/GroceriesCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { DatePoll } from '@/components/trip/DatePoll';
import { GuestList } from '@/components/trip/GuestList';
import { ActivityFeed } from '@/components/trip/ActivityFeed';
import { AddToCalendarButton } from '@/components/trip/AddToCalendarButton';

async function getTrip(slug: string): Promise<TripWithDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      theme:themes(*),
      lodging(*, votes:lodging_votes(*, user:users(*))),
      flights(*),
      transport(*),
      restaurants(*),
      activities(*),
      groceries(*),
      members:trip_members(*, user:users(*)),
      organizer:users!trips_organizer_id_fkey(*),
      comments(*, user:users(*)),
      polls(*, votes:poll_votes(*, user:users(*)))
    `
    )
    .eq('share_slug', slug)
    .order('sort_order', { referencedTable: 'lodging', ascending: true })
    .order('sort_order', { referencedTable: 'flights', ascending: true })
    .order('sort_order', { referencedTable: 'transport', ascending: true })
    .order('sort_order', { referencedTable: 'restaurants', ascending: true })
    .order('sort_order', { referencedTable: 'activities', ascending: true })
    .order('sort_order', { referencedTable: 'groceries', ascending: true })
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as TripWithDetails;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) return { title: 'rally — not found' };

  const dateStr =
    trip.date_start && trip.date_end
      ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
      : '';

  const cost = calculateTripCost(trip);
  const description = [
    trip.destination,
    dateStr,
    cost.per_person_total > 0 ? `~$${cost.per_person_total}/person` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${trip.name} — rally`,
    description,
    openGraph: {
      title: trip.name,
      description: trip.tagline ? `${trip.tagline} — ${description}` : description,
      type: 'website',
      siteName: 'rally',
      url: `${appUrl}/trip/${slug}`,
      ...(trip.cover_image_url
        ? { images: [{ url: trip.cover_image_url, width: 1200, height: 630, alt: trip.name }] }
        : {}),
    },
    twitter: {
      card: trip.cover_image_url ? 'summary_large_image' : 'summary',
      title: trip.name,
      description,
      ...(trip.cover_image_url ? { images: [trip.cover_image_url] } : {}),
    },
  };
}

export default async function TripPage({ params }: Props) {
  const { slug } = await params;
  const trip = await getTrip(slug);
  if (!trip) notFound();

  track('trip_page_viewed', { tripId: trip.id, metadata: { phase: trip.phase, slug } });

  // Identity: Supabase auth session OR signed guest cookie. Either path
  // bumps the rolling 30-day window per phase 11.
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const guestUserId = await getGuestUserId();
  const currentUserId = currentUser?.id || guestUserId || null;
  if (currentUserId) await refreshGuestCookie();

  // Map the legacy DB theme row to a chassis ThemeId. The chassis CSS
  // [data-theme="..."] block sets the 8 chassis vars; per-theme strings
  // are resolved via getCopy(themeId, ...).
  const themeId = chassisThemeIdFromTemplate(trip.theme?.template_name);
  const theme = getTheme(themeId);

  const lodging = trip.lodging || [];
  const flights = trip.flights || [];
  const transport = trip.transport || [];
  const restaurants = trip.restaurants || [];
  const activities = trip.activities || [];
  const groceries = trip.groceries || [];
  const members = trip.members || [];
  const organizer = trip.organizer;
  const comments = trip.comments || [];
  const polls = trip.polls || [];

  const cost = calculateTripCost(trip);

  // Resolve the viewer's RSVP via the boundary mapper so the chassis sees
  // 'holding' instead of legacy 'maybe'. Server-side render is the right
  // place for this — the sticky bar gets a chassis-shaped value as input.
  const viewerMember = currentUserId
    ? members.find((m) => m.user_id === currentUserId)
    : null;
  const viewerRsvp = viewerMember ? dbRsvpToRally(viewerMember.rsvp) : null;
  const viewerName = viewerMember?.user?.display_name ?? null;
  const viewerEmail = viewerMember?.user?.email ?? null;

  // Counts for the going row + cost split
  const inCount = members.filter((m) => m.rsvp === 'in').length;
  const goingMembers = members.filter((m) => m.rsvp === 'in');

  // Two countdowns: days-until-trip (hero) and days-until-cutoff (secondary).
  const tripStartIso = trip.date_start;
  const cutoffIso = trip.commit_deadline;

  // Theme-themed flag for the hero countdown — pull from theme.strings.fomoFlag.
  const fomoFlag = theme.strings.fomoFlag;

  // ─── Sketch-phase short-circuit ───────────────────────────────────────
  // When a trip is in sketch phase, the trip page IS the builder.
  // Render the inline-edit sketch shell instead of the live trip
  // subtree. The rest of this function's logic (going counts,
  // cards, sticky RSVP) applies only to sell/lock/go.
  if (trip.phase === 'sketch') {
    return (
      <div className="chassis" data-theme={themeId}>
        <SketchTripShell
          themeId={themeId}
          tripId={trip.id}
          slug={slug}
          organizerId={organizer.id}
          organizerName={organizer.display_name}
          coverImageUrl={trip.cover_image_url}
          members={members}
          crewReady={hasNonOrganizerMember(members, organizer.id)}
          initial={{
            name: trip.name,
            tagline: trip.tagline,
            destination: trip.destination,
            date_start: trip.date_start,
            date_end: trip.date_end,
          }}
        />
      </div>
    );
  }

  // Hero countdown label per phase. Sketch was short-circuited above,
  // so only sell / lock / go land here. Sell = "days to lock it in"
  // (counting toward cutoff). Lock/Go = themed signature countdown
  // ("days until liftoff" by default, "days until 'i do'" for
  // bachelorette, etc.) via theme.strings.countdownSignature.
  const themedSignature =
    typeof theme.strings.countdownSignature === 'string'
      ? theme.strings.countdownSignature
      : theme.strings.countdownSignature?.({});
  const heroLabel =
    trip.phase === 'sell'
      ? getCopy(themeId, 'tripPageShared.countdown.label.toLock')
      : themedSignature ?? getCopy(themeId, 'tripPageShared.countdown.label.signature');

  return (
    <div className="chassis" data-theme={themeId}>
      <PostcardHero
        themeId={themeId}
        tripName={trip.name}
        destination={trip.destination}
        tagline={trip.tagline}
        coverImageUrl={trip.cover_image_url}
        organizerName={organizer.display_name}
        phase={trip.phase}
        isLive={trip.phase === 'go'}
      />

      {/* Hero countdown — days until trip start */}
      {tripStartIso && (
        <ChassisCountdown target={tripStartIso} label={heroLabel} flag={fomoFlag} />
      )}

      {/* Secondary countdown — cutoff (only meaningful in sell phase) */}
      {cutoffIso && trip.phase === 'sell' && (
        <ChassisCountdown
          target={cutoffIso}
          label={getCopy(themeId, 'tripPageShared.countdown.label.toLock')}
        />
      )}

      {/* Going row — going-label + avatar cascade */}
      <div className="going">
        <div className="going-label">
          {inCount > 0
            ? getCopy(themeId, 'tripPageShared.going.labelN', { n: inCount })
            : getCopy(themeId, 'tripPageShared.going.empty')}
        </div>
        <div className="avatars">
          {goingMembers.slice(0, 6).map((m) => {
            const initial = (m.user?.display_name ?? '?').slice(0, 1).toUpperCase();
            return (
              <div key={m.id} className="av" style={{ background: 'var(--sticker-bg)' }}>
                {initial}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 18px' }}>
        {/* Add-to-calendar — secondary action under going row */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <AddToCalendarButton trip={trip} />
        </div>

        {/* Organizer card */}
        <div style={{ marginTop: 16 }}>
          <OrganizerCard organizer={organizer} tripName={trip.name} />
        </div>

        {trip.description && (
          <div style={{ marginTop: 10 }}>
            <Description text={trip.description} />
          </div>
        )}
      </div>

      {/* Lodging gallery — chassis .house cards */}
      <LodgingGallery themeId={themeId} lodging={lodging} />

      <div style={{ padding: '0 18px' }}>
        {/* Flights / Transport / Activities / Groceries / Restaurants — kept
            as v0 typed components, rebuilt against chassis in Session 2/3.
            They live inside .chassis so the surrounding context still works,
            but their internals use legacy styles for now. */}
        {flights.map((flight) => (
          <div key={flight.id} style={{ marginTop: 12 }}>
            <FlightCard flight={flight} />
          </div>
        ))}
        {transport.map((t) => (
          <div key={t.id} style={{ marginTop: 12 }}>
            <TransportCard transport={t} memberCount={cost.confirmed_count} />
          </div>
        ))}
        {activities.map((a) => (
          <div key={a.id} style={{ marginTop: 12 }}>
            <ActivityCard activity={a} />
          </div>
        ))}
        {groceries.map((g) => (
          <div key={g.id} style={{ marginTop: 12 }}>
            <GroceriesCard grocery={g} />
          </div>
        ))}
        {restaurants.map((r) => (
          <div key={r.id} style={{ marginTop: 12 }}>
            <RestaurantCard restaurant={r} />
          </div>
        ))}

        {/* Cost breakdown — split-shared mode only for v0 */}
        <div style={{ marginTop: 14 }}>
          <CostBreakdown trip={trip} cost={cost} dateStr={trip.date_start && trip.date_end
            ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
            : ''} />
        </div>

        {polls.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <DatePoll poll={polls[0]} currentUserId={currentUserId} />
          </div>
        )}

        {/* Guest list — v0 component, will be replaced by /trip/[slug]/crew in Session 2 */}
        <div style={{ marginTop: 14 }}>
          <GuestList members={members} organizerId={organizer.id} />
        </div>

        {/* Activity feed — v0 component, will become the buzz feed in Session 2 */}
        <div id="group-chat" style={{ marginTop: 14 }}>
          <ActivityFeed comments={comments} tripId={trip.id} currentUserId={currentUserId} />
        </div>

        {/* Optional extras — v0 component, will become the extras drawer in Session 3 */}
        <ExtrasSections
          packingList={trip.packing_list || []}
          playlistUrl={trip.playlist_url}
          houseRules={trip.house_rules}
          photoAlbumUrl={trip.photo_album_url}
        />
      </div>

      <PoeticFooter themeId={themeId} />

      {/* Spacer so content scrolls past the sticky bar */}
      <div style={{ height: 90 }} />

      <StickyRsvpBarChassis
        themeId={themeId}
        tripId={trip.id}
        current={viewerRsvp}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
      />
    </div>
  );
}
