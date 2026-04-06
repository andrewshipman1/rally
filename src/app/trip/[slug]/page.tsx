import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { themeToCSS, calculateTripCost } from '@/types';
import type { TripWithDetails } from '@/types';
import { format } from 'date-fns';

import { CollageHeader } from '@/components/trip/CollageHeader';
import { AddToCalendarButton } from '@/components/trip/AddToCalendarButton';
import { OrganizerCard } from '@/components/trip/OrganizerCard';
import { Description } from '@/components/trip/Description';
import { ExtrasSections } from '@/components/trip/ExtrasSections';
import { Countdown } from '@/components/trip/Countdown';
import { LodgingCarousel } from '@/components/trip/LodgingCarousel';
import { FlightCard } from '@/components/trip/FlightCard';
import { TransportCard } from '@/components/trip/TransportCard';
import { RestaurantCard } from '@/components/trip/RestaurantCard';
import { ActivityCard } from '@/components/trip/ActivityCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { DatePoll } from '@/components/trip/DatePoll';
import { GuestList } from '@/components/trip/GuestList';
import { ActivityFeed } from '@/components/trip/ActivityFeed';
import { StickyRsvpBar } from '@/components/trip/StickyRsvpBar';
import { Footer } from '@/components/trip/Footer';
import { Reveal } from '@/components/ui/Reveal';

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
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as TripWithDetails;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);

  if (!trip) return { title: 'Trip not found — Rally' };

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
    title: `${trip.name} — Rally`,
    description,
    openGraph: {
      title: trip.name,
      description: trip.tagline ? `${trip.tagline} — ${description}` : description,
      type: 'website',
      siteName: 'Rally',
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

  // Get current user for voting
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const theme = trip.theme;
  const cssVars = theme ? themeToCSS(theme) : null;
  const fontDisplay = theme?.font_display || 'Fraunces';
  const fontBody = theme?.font_body || 'Outfit';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontDisplay)}:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400&family=${encodeURIComponent(fontBody)}:wght@400;500;600;700&display=swap`;

  const lodging = trip.lodging || [];
  const flights = trip.flights || [];
  const transport = trip.transport || [];
  const restaurants = trip.restaurants || [];
  const activities = trip.activities || [];
  const members = trip.members || [];
  const organizer = trip.organizer;
  const comments = trip.comments || [];
  const polls = trip.polls || [];

  const cost = calculateTripCost(trip);

  const dateStr =
    trip.date_start && trip.date_end
      ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
      : '';

  const bgStyle =
    theme?.background_value ||
    'linear-gradient(168deg, #122c35 0%, #1a3d4a 12%, #2d6b5a 28%, #3a8a7a 42%, #d4a574 62%, #e8c9a0 78%, #f5e6d0 92%, #faf3eb 100%)';

  return (
    <>
      <link href={fontUrl} rel="stylesheet" />
      <div
        style={{
          minHeight: '100vh',
          background: bgStyle,
          fontFamily: `'${fontBody}', sans-serif`,
          position: 'relative',
          paddingBottom: 100,
          ...(cssVars as React.CSSProperties),
        }}
      >
        {/* Grain overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            opacity: 0.03,
            pointerEvents: 'none',
            mixBlendMode: 'overlay',
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div
          style={{
            position: 'fixed',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,201,160,0.1) 0%, transparent 70%)',
            top: '5%',
            right: '-15%',
            animation: 'drift 9s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative' }}>
          <CollageHeader
            trip={trip}
            theme={theme}
            organizer={organizer}
            members={members}
            dateStr={dateStr}
            confirmedCount={cost.confirmed_count}
          />

          <div style={{ padding: '0 20px' }}>
            {/* Add to calendar */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <AddToCalendarButton trip={trip} />
            </div>

            {/* Organizer Card */}
            <Reveal delay={0.15}>
              <div style={{ marginTop: 16, marginBottom: 4 }}>
                <OrganizerCard organizer={organizer} />
              </div>
            </Reveal>

            {/* Description */}
            {trip.description && (
              <Reveal delay={0.18}>
                <div style={{ marginTop: 14 }}>
                  <Description text={trip.description} />
                </div>
              </Reveal>
            )}

            {/* Countdown */}
            {trip.commit_deadline && (
              <Reveal delay={0.2}>
                <div style={{ marginTop: 14 }}>
                  <Countdown deadline={trip.commit_deadline} />
                </div>
              </Reveal>
            )}

            {/* Lodging Carousel */}
            {lodging.length > 0 && (
              <Reveal delay={0.1}>
                <div style={{ marginTop: 14 }}>
                  <LodgingCarousel lodging={lodging} currentUserId={currentUser?.id || null} />
                </div>
              </Reveal>
            )}

            {/* Flights */}
            {flights.map((flight, i) => (
              <Reveal key={flight.id} delay={0.04 * i}>
                <div style={{ marginTop: 12 }}>
                  <FlightCard flight={flight} />
                </div>
              </Reveal>
            ))}

            {/* Transport */}
            {transport.map((t, i) => (
              <Reveal key={t.id} delay={0.04 * i}>
                <div style={{ marginTop: 12 }}>
                  <TransportCard transport={t} />
                </div>
              </Reveal>
            ))}

            {/* Activities */}
            {activities.map((a, i) => (
              <Reveal key={a.id} delay={0.04 * i}>
                <div style={{ marginTop: 12 }}>
                  <ActivityCard activity={a} />
                </div>
              </Reveal>
            ))}

            {/* Restaurants */}
            {restaurants.map((r, i) => (
              <Reveal key={r.id} delay={0.04 * i}>
                <div style={{ marginTop: 12 }}>
                  <RestaurantCard restaurant={r} />
                </div>
              </Reveal>
            ))}

            {/* Cost Breakdown */}
            <Reveal delay={0.1}>
              <div style={{ marginTop: 14 }}>
                <CostBreakdown trip={trip} cost={cost} dateStr={dateStr} />
              </div>
            </Reveal>

            {/* Date Poll */}
            {polls.length > 0 && (
              <Reveal delay={0.05}>
                <div style={{ marginTop: 14 }}>
                  <DatePoll poll={polls[0]} />
                </div>
              </Reveal>
            )}

            {/* Guest List */}
            <Reveal delay={0.05}>
              <div style={{ marginTop: 14 }}>
                <GuestList members={members} organizerId={organizer.id} />
              </div>
            </Reveal>

            {/* Activity Feed (RSVPs + comments) */}
            <Reveal delay={0.05}>
              <div id="group-chat" style={{ marginTop: 14 }}>
                <ActivityFeed comments={comments} tripId={trip.id} />
              </div>
            </Reveal>

            {/* Optional Extras */}
            <ExtrasSections
              packingList={trip.packing_list || []}
              playlistUrl={trip.playlist_url}
              houseRules={trip.house_rules}
              photoAlbumUrl={trip.photo_album_url}
            />

            <Footer />
          </div>
        </div>

        {/* Sticky bottom RSVP bar */}
        <StickyRsvpBar tripId={trip.id} emojis={trip.rsvp_emojis} />
      </div>
    </>
  );
}
