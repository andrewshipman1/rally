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
import { CountdownScoreboard } from '@/components/trip/CountdownScoreboard';
import { LodgingCard } from '@/components/trip/builder/LodgingCard';
import { StickyRsvpBarChassis } from '@/components/trip/StickyRsvpBarChassis';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { SketchTripShell } from '@/components/trip/builder/SketchTripShell';
import { InviteeShell } from '@/components/trip/InviteeShell';
// Session 5: inline sections + module slots
import { ModuleSlot } from '@/components/trip/ModuleSlot';
import { CrewSection } from '@/components/trip/CrewSection';
// Session 9Q — buzz section + its feed query removed from the sell page.
// The component file, query helper, and lexicon surface all remain on disk
// (unmodified) for when buzz gets a dedicated redesign.

// Carry-over typed component cards from v0
import { Description } from '@/components/trip/Description';
import { ExtrasSections } from '@/components/trip/ExtrasSections';
import { TransportCard } from '@/components/trip/TransportCard';
import { FlightCard } from '@/components/trip/FlightCard';
import { SellHeadliner } from '@/components/trip/SellHeadliner';
import { EverythingElse } from '@/components/trip/EverythingElse';
import { GettingHere } from '@/components/trip/GettingHere';
import { PlaylistCard } from '@/components/trip/PlaylistCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { DatePoll } from '@/components/trip/DatePoll';
import { Reveal } from '@/components/ui/Reveal';
import { PassportProvider } from '@/components/trip/PassportContext';

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
  const transport = trip.transport || [];
  const flights = trip.flights || [];
  const groceries = trip.groceries || [];

  // Session 9A — "everything else" read-only rows on sell. Values come from
  // the same columns sketch writes to (8P). Rows omit individually if null/
  // zero; the whole module omits if all three are unset.
  const activitiesDollars =
    trip.activities_estimate_per_person_cents != null
      ? Math.round(trip.activities_estimate_per_person_cents / 100)
      : null;
  const provisionsDollars =
    groceries.find((g) => g.name === 'Provisions')?.estimated_total ?? null;
  const otherDollars =
    groceries.find((g) => g.name === 'Other')?.estimated_total ?? null;
  const hasEverythingElse =
    (activitiesDollars ?? 0) > 0 ||
    (provisionsDollars ?? 0) > 0 ||
    (otherDollars ?? 0) > 0;
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
        organizerName={organizer.display_name}
        organizerId={organizer.id}
        coverImageUrl={trip.cover_image_url}
        members={members}
        crewCount={cost.divisor_used}
        lodging={lodging}
        transport={transport}
        groceries={groceries}
        packingList={trip.packing_list || []}
        playlistUrl={trip.playlist_url}
        playlistOgImage={trip.playlist_og_image}
        playlistOgTitle={trip.playlist_og_title}
        playlistSetByName={trip.playlist_set_by_name}
        playlistSetAt={trip.playlist_set_at}
        houseRules={trip.house_rules}
        photoAlbumUrl={trip.photo_album_url}
        phase={trip.phase}
        headliner={{
          description: trip.headliner_description,
          costCents: trip.headliner_cost_cents,
          costUnit: trip.headliner_cost_unit,
          linkUrl: trip.headliner_link_url,
          imageUrl: trip.headliner_image_url,
          sourceTitle: trip.headliner_source_title,
        }}
        activitiesEstimate={
          trip.activities_estimate_per_person_cents != null
            ? Math.round(trip.activities_estimate_per_person_cents / 100)
            : null
        }
        initial={{
          name: trip.name,
          tagline: trip.tagline,
          destination: trip.destination,
          date_start: trip.date_start,
          date_end: trip.date_end,
          commit_deadline: trip.commit_deadline,
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
  // Sell phase: hero counts to lock deadline ("days to lock it in").
  // Lock/Go: hero counts to trip start with themed signature ("days until liftoff").
  const heroLabel = trip.phase === 'sell'
    ? getCopy(themeId, 'tripPageShared.countdown.label.toLock') as string
    : (themedSignature ?? getCopy(themeId, 'tripPageShared.countdown.label.signature'));

  // Session 9D — scoreboard copy. Sell gets kicker + date + hint + emoji
  // (the full mockup shape). Lock/go runs "lite" (tiles + heroLabel only)
  // until lock-phase polish lands — zero lock trips exist today per 9A
  // Actuals. Units are structural labels, shared across phases.
  const sbKicker = getCopy(themeId, 'tripPageSell.scoreboard.kicker');
  const sbHint = getCopy(themeId, 'tripPageSell.scoreboard.hint');
  const sbHintEmoji = getCopy(themeId, 'tripPageSell.scoreboard.hintEmoji');
  const sbUnits = {
    days: getCopy(themeId, 'tripPageShared.scoreboard.units.days'),
    hours: getCopy(themeId, 'tripPageShared.scoreboard.units.hours'),
    minutes: getCopy(themeId, 'tripPageShared.scoreboard.units.minutes'),
    seconds: getCopy(themeId, 'tripPageShared.scoreboard.units.seconds'),
  };

  return (
    <PassportProvider>
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
        inCount={inCount}
        cutoffIso={cutoffIso}
        dateStartIso={trip.date_start}
        dateEndIso={trip.date_end}
      />

      {/* Session 9D — countdown scoreboard. Sell: full shape (kicker + date +
          tiles + hint) targeting cutoff. Lock/go: lite shape (tiles + themed
          heroLabel) targeting trip start. Secondary sell countdown dropped
          per wireframe: one scoreboard, not two. */}
      {trip.phase === 'sell' && cutoffIso && (
        <CountdownScoreboard
          target={cutoffIso}
          units={sbUnits}
          kicker={sbKicker}
          hint={sbHint}
          hintEmoji={sbHintEmoji}
        />
      )}
      {trip.phase !== 'sell' && tripStartIso && (
        <CountdownScoreboard
          target={tripStartIso}
          units={sbUnits}
          hint={heroLabel}
        />
      )}

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

      {/* Session 9A — hero-adjacent going row removed. <CrewSection> below
          is the single crew surface on sell / lock / go. */}

      <div style={{ padding: '0 18px' }}>
        {trip.description && (
          <Reveal delay={0.1}>
            <div style={{ marginTop: 10 }}>
              <Description text={trip.description} />
            </div>
          </Reveal>
        )}
      </div>

      {/* ─── Module sections — Session 9A canonical order ─────────────
          headliner → spot → (Getting Here 9B) → transportation →
          everything-else → crew → cost → aux → extras(lock/go) */}

      {/* 1 · Headliner — sketch parity on sell (9H). Wrapped in
             `.module-section` with a `.module-section-header` ("the
             headliner" / "rough estimate") that mirrors SketchModules.tsx
             exactly. SellHeadliner passes readOnly={true} under option C. */}
      {trip.headliner_description && (
        <Reveal delay={0}>
          <div style={{ padding: '0 18px', marginTop: 14 }}>
            <div className="module-section headliner-module">
              <div className="module-section-header">
                <span className="module-section-title">
                  {getCopy(themeId, 'builderState.headliner.eyebrow')}
                </span>
                <span className="module-section-count">
                  {getCopy(themeId, 'builderState.headliner.estimateCaption')}
                </span>
              </div>
              <SellHeadliner
                themeId={themeId}
                headliner={{
                  description: trip.headliner_description,
                  costCents: trip.headliner_cost_cents,
                  costUnit: trip.headliner_cost_unit,
                  linkUrl: trip.headliner_link_url,
                  imageUrl: trip.headliner_image_url,
                  sourceTitle: trip.headliner_source_title,
                }}
              />
            </div>
          </div>
        </Reveal>
      )}

      {/* 2 · Spot (lodging) — 9I: consolidated into LodgingCard with voting prop.
             Sketch renders LodgingCard without the prop; sell passes it to
             branch into voting UI. Wrap matches 9H headliner pattern. */}
      <Reveal delay={0.05}>
        {lodging.length > 0 ? (() => {
          const votingLocked = lodging.some((l) => l.is_selected);
          const totalVotes = lodging.reduce((sum, l) => sum + l.votes.length, 0);
          return (
            <div style={{ padding: '0 18px', marginTop: 14 }}>
              <div className="module-section lodging-module">
                <div className="module-section-header">
                  <span className="module-section-title">
                    {getCopy(themeId, 'tripPageShared.lodging.h2')}
                  </span>
                  <span className={`voting-pill ${votingLocked ? 'locked' : 'open'}`}>
                    {getCopy(themeId, votingLocked
                      ? 'lodgingVoting.pill.locked'
                      : 'lodgingVoting.pill.open')}
                  </span>
                </div>
                <div className="lodging-cards">
                  {lodging.map((spot) => (
                    <LodgingCard
                      key={spot.id}
                      spot={spot}
                      themeId={themeId}
                      tripId={trip.id}
                      slug={slug}
                      dateStart={trip.date_start}
                      dateEnd={trip.date_end}
                      crewCount={cost.divisor_used}
                      voting={{
                        currentUserId,
                        isOrganizer,
                        votingLocked,
                        votes: spot.votes,
                        allLodging: lodging,
                        totalVotes,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })() : (
          <ModuleSlot
            title={getCopy(themeId, 'tripPageShared.lodging.h2')}
            emptyText={getCopy(themeId, 'emptyStates.lodging')}
            hasContent={false}
          />
        )}
      </Reveal>

      {/* 3 · Getting Here — Session 9B. 9B-2 wraps the Reveal in the
             padding-18 inset used by spot above so the .module-section
             edges align with its siblings. */}
      {viewerMember && (
        <div style={{ padding: '0 18px', marginTop: 14 }}>
          <Reveal delay={0.075}>
            <GettingHere
              tripId={trip.id}
              slug={slug}
              themeId={themeId}
              userArrival={{
                mode: viewerMember.arrival_mode ?? null,
                cost_cents: viewerMember.arrival_cost_cents ?? null,
              }}
              passportBasedIn={viewerMember.user?.home_city ?? null}
              tripDestination={trip.destination ?? ''}
              dateStart={trip.date_start ?? ''}
              dateEnd={trip.date_end ?? ''}
            />
          </Reveal>
        </div>
      )}

      <div style={{ padding: '0 18px' }}>
        {/* 4 · Transportation — compact-card shape (Session 9K).
               Flights + transport render as interleaved line items
               inside one .module-section. Read-only: whole-card tap
               opens booking_link when present; non-interactive <div>
               otherwise. Section omits entirely when both lists empty. */}
        {(transport.length > 0 || flights.length > 0) && (
          <Reveal delay={0.1}>
            <div className="module-section transport-module" style={{ marginTop: 14 }}>
              <div className="module-section-header">
                <span className="module-section-title">
                  {getCopy(themeId, 'tripPageShared.transport.h2')}
                </span>
                <span className="module-section-count">
                  {transport.length + flights.length} item{transport.length + flights.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="transport-module-cards">
                {flights.map((f) => (
                  <FlightCard key={f.id} flight={f} themeId={themeId} />
                ))}
                {transport.map((t) => (
                  <TransportCard key={t.id} transport={t} themeId={themeId} />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* 5 · Everything else — extracted to EverythingElse.tsx (9L). */}
        {hasEverythingElse && (
          <Reveal delay={0.15}>
            <EverythingElse
              themeId={themeId}
              activitiesDollars={activitiesDollars}
              provisionsDollars={provisionsDollars}
              otherDollars={otherDollars}
            />
          </Reveal>
        )}

        {/* 6 · Crew — single crew surface on sell / lock / go */}
        <Reveal delay={0.2}>
          <CrewSection
            members={members}
            organizerId={organizer.id}
            currentUserId={currentUserId}
            themeId={themeId}
            tripName={trip.name}
            tripId={trip.id}
            slug={slug}
          />
        </Reveal>

        {/* 7 · Cost breakdown — moved below crew in 9A. Session 9B-2
               takes the current viewer's arrival (joined on the
               trip_members query in _data.ts via 9B-1) and passes it
               down so the hero + "your way in" row personalize to the
               reader. viewerArrival = null (logged-out / non-member
               edge — logged-out is short-circuited upstream at page
               line 163, so this fallback only fires for the narrow
               signed-in-but-not-a-member case) keeps the old
               group-average hero. */}
        <Reveal delay={0.25}>
          <CostBreakdown
            trip={trip}
            cost={cost}
            themeId={themeId}
            dateStr={trip.date_start && trip.date_end
              ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
              : ''}
            viewerArrival={
              viewerMember
                ? {
                    mode: viewerMember.arrival_mode ?? null,
                    cost_cents: viewerMember.arrival_cost_cents ?? null,
                  }
                : null
            }
          />
        </Reveal>

        {polls.length > 0 && (
          <Reveal delay={0.28}>
            <div style={{ marginTop: 14 }}>
              <DatePoll poll={polls[0]} currentUserId={currentUserId} />
            </div>
          </Reveal>
        )}

        {/* 9Q — buzz section removed from sell render; files preserved on disk. */}

        {/* 9 · Aux (PlaylistCard) — promoted out of ExtrasSections on sell.
               Scoped to sell only: on lock / go / done, <ExtrasSections>
               still renders <PlaylistCard> internally (per 8Q), and
               rendering a standalone one here would duplicate it. Moving
               the promotion up the phase ladder would require modifying
               <ExtrasSections>, which the 9A brief prohibits — flagged as
               a follow-up for the lock-phase depth work. */}
        {trip.phase === 'sell' && (
          <Reveal delay={0.35}>
            <div className="sell-aux-wrap" style={{ marginTop: 14 }}>
              <PlaylistCard
                url={trip.playlist_url}
                ogImage={trip.playlist_og_image}
                ogTitle={trip.playlist_og_title}
                setByName={trip.playlist_set_by_name}
                setAt={trip.playlist_set_at}
                canEdit={isOrganizer}
                tripId={trip.id}
                slug={slug}
                themeId={themeId}
              />
            </div>
          </Reveal>
        )}

        {/* Extras — packing list, house rules, photo album (+ playlist on
            lock/go/done). Skipped on sell entirely: 8Q already phase-gates
            packing / rules / album hidden on sell, and playlist now
            renders as a standalone aux slot above. Lock / go / done
            render <ExtrasSections> normally (aux stays inside it there). */}
        {trip.phase !== 'sell' && (
          <Reveal delay={0.4}>
            <ExtrasSections
              phase={trip.phase}
              packingList={trip.packing_list || []}
              playlistUrl={trip.playlist_url}
              playlistOgImage={trip.playlist_og_image}
              playlistOgTitle={trip.playlist_og_title}
              playlistSetByName={trip.playlist_set_by_name}
              playlistSetAt={trip.playlist_set_at}
              houseRules={trip.house_rules}
              photoAlbumUrl={trip.photo_album_url}
              isOrganizer={isOrganizer}
              tripId={trip.id}
              slug={slug}
              themeId={themeId}
            />
          </Reveal>
        )}
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
    </PassportProvider>
  );
}
