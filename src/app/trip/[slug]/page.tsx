import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getGuestUserId, refreshGuestCookie } from '@/lib/guest-auth';
import { calculateTripCost } from '@/types';
import { format } from 'date-fns';
import { track } from '@/lib/analytics';
import { getTrip } from './_data';

import type { RallyRsvp } from '@/lib/rally-types';
import { chassisThemeIdFromTemplate } from '@/lib/themes/from-db';
import { getTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes/types';
import { getCopy } from '@/lib/copy/get-copy';

// New chassis components
import { PostcardHero } from '@/components/trip/PostcardHero';
import { ChassisCountdown } from '@/components/trip/ChassisCountdown';
import { LodgingGallery } from '@/components/trip/LodgingGallery';
import { StickyRsvpBarChassis } from '@/components/trip/StickyRsvpBarChassis';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { SketchTripShell } from '@/components/trip/builder/SketchTripShell';
import { InviteeShell } from '@/components/trip/InviteeShell';
import { hasNonOrganizerMember } from '@/lib/builder/ungate';

// Session 5: inline sections + module slots
import { ModuleSlot } from '@/components/trip/ModuleSlot';
import { CrewSection } from '@/components/trip/CrewSection';
import { BuzzSection } from '@/components/trip/BuzzSection';
import { ShareLinkButton } from '@/components/trip/ShareLinkButton';
import { getBuzzFeed } from '@/lib/buzz';

// Carry-over typed component cards from v0
import { OrganizerCard } from '@/components/trip/OrganizerCard';
import { Description } from '@/components/trip/Description';
import { ExtrasSections } from '@/components/trip/ExtrasSections';
import { FlightCard } from '@/components/trip/FlightCard';
import { TransportCard } from '@/components/trip/TransportCard';
// RestaurantCard removed — not in v1 module order
import { ActivityCard } from '@/components/trip/ActivityCard';
import { GroceriesCard } from '@/components/trip/GroceriesCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { DatePoll } from '@/components/trip/DatePoll';
import { AddToCalendarButton } from '@/components/trip/AddToCalendarButton';
import { Reveal } from '@/components/ui/Reveal';

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
  const themeId = (trip.chassis_theme_id as ThemeId) || chassisThemeIdFromTemplate(trip.theme?.template_name);
  const theme = getTheme(themeId);

  const lodging = trip.lodging || [];
  const flights = trip.flights || [];
  const transport = trip.transport || [];
  // restaurants removed from v1 module order
  const activities = trip.activities || [];
  const groceries = trip.groceries || [];
  const members = trip.members || [];
  const organizer = trip.organizer;
  const polls = trip.polls || [];

  const cost = calculateTripCost(trip);
  const isOrganizer = currentUserId === trip.organizer_id;

  const viewerMember = currentUserId
    ? members.find((m) => m.user_id === currentUserId)
    : null;
  const viewerRsvp: RallyRsvp | null = viewerMember?.rsvp ?? null;
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
  // ─── Invitee pre-login short-circuit ──────────────────────────────────
  // Phase 5: an unauthenticated viewer (no Supabase session AND no guest
  // cookie) on a non-sketch trip sees the locked/blurred invitee shell
  // instead of the full plan. Login gate, not RSVP gate — the header,
  // countdown, and going row stay visible; only the plan is blurred
  // behind a "sign in to see the plan ↑" overlay. Sketch trips are
  // handled by the block below (the organizer is always authenticated
  // in sketch phase, so this check never fires for them).
  if (currentUserId === null && trip.phase !== 'sketch') {
    return (
      <div className="chassis" data-theme={themeId}>
        <InviteeShell
          themeId={themeId}
          slug={slug}
          trip={trip}
          goingMembers={goingMembers}
          inCount={inCount}
          cost={cost}
        />
      </div>
    );
  }

  if (trip.phase === 'sketch') {
    // Phase 6: SketchTripShell owns its own `.chassis` wrapper so the
    // theme picker can drive live preview via React state. Do NOT
    // re-wrap here or the data-theme attribute will double-up and the
    // picker's preview swap will be shadowed.
    return (
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
    themedSignature ?? getCopy(themeId, 'tripPageShared.countdown.label.signature');

  // Fetch buzz feed for inline section
  const buzzDays = await getBuzzFeed(trip.id, currentUserId, themeId);

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

      {/* T-3 / T-0 deadline nudge banners (sell phase only) */}
      {(() => {
        if (trip.phase !== 'sell' || !cutoffIso) return null;
        const daysToDeadline = Math.ceil(
          // eslint-disable-next-line react-hooks/purity -- server component renders once
          (new Date(cutoffIso).getTime() - Date.now()) / 86_400_000,
        );
        const holdingCount = members.filter((m) => m.rsvp === 'holding').length;
        if (daysToDeadline <= 0) {
          return (
            <div className="deadline-banner deadline-banner--urgent">
              {getCopy(themeId, 'cutoff.banner.t0', { n_hold: holdingCount })}
            </div>
          );
        }
        if (daysToDeadline <= 3) {
          return (
            <div className="deadline-banner">
              {getCopy(themeId, 'cutoff.banner.t3')}
            </div>
          );
        }
        return null;
      })()}

      {/* Post-lock banner */}
      {trip.phase === 'lock' && (
        <div className="lock-banner">
          <div className="lock-banner-text">
            {getCopy(themeId, 'lockFlow.postLock.banner')}
          </div>
          <div className="lock-banner-sub">
            {getCopy(themeId, 'lockFlow.postLock.subtitle')}
          </div>
        </div>
      )}

      {/* Going row — going-label + avatar cascade */}
      <div className="going">
        <div className="going-label">
          {getCopy(themeId, 'tripPageShared.going.label')}
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
        {/* Share link — sell+ only */}
        <Reveal delay={0}>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <ShareLinkButton slug={slug} themeId={themeId} />
          </div>
        </Reveal>

        {/* Add-to-calendar — secondary action under going row */}
        <Reveal delay={0}>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <AddToCalendarButton trip={trip} themeId={themeId} />
          </div>
        </Reveal>

        {/* Organizer card */}
        <Reveal delay={0.05}>
          <div style={{ marginTop: 16 }}>
            <OrganizerCard organizer={organizer} tripName={trip.name} />
          </div>
        </Reveal>

        {trip.description && (
          <Reveal delay={0.1}>
            <div style={{ marginTop: 10 }}>
              <Description text={trip.description} />
            </div>
          </Reveal>
        )}
      </div>

      {/* ─── Module sections in correct order ─────────────────────── */}

      {/* Lodging — "the spot" */}
      <Reveal delay={0}>
        {lodging.length > 0 ? (
          <LodgingGallery
            themeId={themeId}
            lodging={lodging}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
            slug={slug}
            tripId={trip.id}
            votingLocked={lodging.some((l) => l.is_selected)}
          />
        ) : (
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.lodging.h2')}
            emptyText={getCopy(themeId, 'emptyStates.lodging')}
            hasContent={false}
          />
        )}
      </Reveal>

      <div style={{ padding: '0 18px' }}>
        {/* Flights */}
        <Reveal delay={0.05}>
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.flights.h2')}
            emptyText={getCopy(themeId, 'emptyStates.flights')}
            hasContent={flights.length > 0}
          >
            {flights.map((flight) => (
              <div key={flight.id} style={{ marginTop: 12 }}>
                <FlightCard flight={flight} themeId={themeId} />
              </div>
            ))}
          </ModuleSlot>
        </Reveal>

        {/* Transport — "getting around" */}
        <Reveal delay={0.1}>
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.transport.h2')}
            emptyText={getCopy(themeId, 'emptyStates.transport')}
            hasContent={transport.length > 0}
          >
            {transport.map((t) => (
              <div key={t.id} style={{ marginTop: 12 }}>
                <TransportCard transport={t} memberCount={cost.confirmed_count} themeId={themeId} />
              </div>
            ))}
          </ModuleSlot>
        </Reveal>

        {/* Activities — "what's happening" */}
        <Reveal delay={0.15}>
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.activity.h2')}
            emptyText={getCopy(themeId, 'emptyStates.activities')}
            hasContent={activities.length > 0}
          >
            {activities.map((a) => (
              <div key={a.id} style={{ marginTop: 12 }}>
                <ActivityCard activity={a} themeId={themeId} />
              </div>
            ))}
          </ModuleSlot>
        </Reveal>

        {/* Groceries */}
        <Reveal delay={0.2}>
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.groceries.h2')}
            emptyText={getCopy(themeId, 'emptyStates.groceries')}
            hasContent={groceries.length > 0}
          >
            {groceries.map((g) => (
              <div key={g.id} style={{ marginTop: 12 }}>
                <GroceriesCard grocery={g} />
              </div>
            ))}
          </ModuleSlot>
        </Reveal>

        {/* Cost breakdown */}
        <Reveal delay={0.25}>
          <div style={{ marginTop: 14 }}>
            <CostBreakdown trip={trip} cost={cost} themeId={themeId} dateStr={trip.date_start && trip.date_end
              ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
              : ''} />
          </div>
        </Reveal>

        {polls.length > 0 && (
          <Reveal delay={0.3}>
            <div style={{ marginTop: 14 }}>
              <DatePoll poll={polls[0]} currentUserId={currentUserId} />
            </div>
          </Reveal>
        )}

        {/* Crew — inline section */}
        <Reveal delay={0.35}>
          <CrewSection
            members={members as any}
            organizerId={organizer.id}
            currentUserId={currentUserId}
            themeId={themeId}
            tripName={trip.name}
            tripId={trip.id}
            slug={slug}
          />
        </Reveal>

        {/* Buzz — inline activity feed */}
        <Reveal delay={0.4}>
          <BuzzSection
            buzzDays={buzzDays}
            currentUserId={currentUserId}
            themeId={themeId}
            tripName={trip.name}
            inCount={inCount}
          />
        </Reveal>

        {/* Extras — packing list, playlist, house rules, photo album */}
        <Reveal delay={0.45}>
          <ExtrasSections
            packingList={trip.packing_list || []}
            playlistUrl={trip.playlist_url}
            houseRules={trip.house_rules}
            photoAlbumUrl={trip.photo_album_url}
            isOrganizer={isOrganizer}
            tripId={trip.id}
            slug={slug}
            themeId={themeId}
          />
        </Reveal>
      </div>

      <PoeticFooter themeId={themeId} />

      {/* Spacer so content scrolls past the sticky bar */}
      <div style={{ height: 60 }} />

      <StickyRsvpBarChassis
        themeId={themeId}
        tripId={trip.id}
        current={viewerRsvp}
        viewerName={viewerName}
        viewerEmail={viewerEmail}
        isOrganizer={isOrganizer}
      />
    </div>
  );
}
