import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { themeToCSS } from '@/types';
import type { Trip, Theme, Block, TripMember, User, Comment, Poll, PollVote } from '@/types';
import { format } from 'date-fns';

import { CollageHeader } from '@/components/trip/CollageHeader';
import { OrganizerCard } from '@/components/trip/OrganizerCard';
import { Countdown } from '@/components/trip/Countdown';
import { HouseCard } from '@/components/trip/HouseCard';
import { BlockCard } from '@/components/trip/BlockCard';
import { CostBreakdown } from '@/components/trip/CostBreakdown';
import { DatePoll } from '@/components/trip/DatePoll';
import { GuestList } from '@/components/trip/GuestList';
import { GroupChat } from '@/components/trip/GroupChat';
import { RsvpSection } from '@/components/trip/RsvpSection';
import { Footer } from '@/components/trip/Footer';
import { Reveal } from '@/components/ui/Reveal';

type TripRow = Trip & {
  theme: Theme | null;
  blocks: Block[];
  trip_members: (TripMember & { user: User })[];
  organizer: User;
  comments: (Comment & { user: User })[];
  polls: (Poll & { poll_votes: (PollVote & { user: User })[] })[];
};

async function getTrip(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('trips')
    .select(`
      *,
      theme:themes(*),
      blocks(*),
      trip_members(*, user:users(*)),
      organizer:users!trips_organizer_id_fkey(*),
      comments(*, user:users(*)),
      polls(*, poll_votes(*, user:users(*)))
    `)
    .eq('share_slug', slug)
    .order('sort_order', { referencedTable: 'blocks', ascending: true })
    .order('created_at', { referencedTable: 'comments', ascending: true })
    .single();

  if (error || !data) return null;
  return data as unknown as TripRow;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTrip(slug);

  if (!trip) {
    return { title: 'Trip not found — Rally' };
  }

  const dateStr =
    trip.date_start && trip.date_end
      ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
      : '';

  const confirmedCount = trip.trip_members.filter((m) => m.rsvp === 'in').length;
  const blocks = trip.blocks || [];
  const sharedTotal = blocks
    .filter((b) => b.cost_type === 'shared' && b.cost)
    .reduce((sum, b) => sum + (b.cost ?? 0), 0);
  const perPerson = confirmedCount > 0 ? Math.round(sharedTotal / confirmedCount) : 0;

  const individualTotal = blocks
    .filter((b) => b.cost_type === 'individual' && b.cost)
    .reduce((sum, b) => sum + (b.cost ?? 0), 0);
  const totalPerPerson = perPerson + individualTotal;

  const description = [
    trip.destination,
    dateStr,
    totalPerPerson > 0 ? `~$${totalPerPerson}/person` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    title: `${trip.name} — Rally`,
    description,
    openGraph: {
      title: trip.name,
      description: trip.tagline
        ? `${trip.tagline} — ${description}`
        : description,
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

  const theme = trip.theme;
  const cssVars = theme ? themeToCSS(theme) : null;
  const fontDisplay = theme?.font_display || 'Fraunces';
  const fontBody = theme?.font_body || 'Outfit';
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontDisplay)}:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,800;1,9..144,400&family=${encodeURIComponent(fontBody)}:wght@400;500;600;700&display=swap`;

  const blocks = trip.blocks || [];
  const members = trip.trip_members || [];
  const confirmedCount = members.filter((m) => m.rsvp === 'in').length;
  const organizer = trip.organizer;
  const comments = trip.comments || [];
  const polls = trip.polls || [];

  // Separate the "house" block (first block / sort_order 0) from other blocks
  const houseBlock = blocks.find((b) => b.sort_order === 0);
  const otherBlocks = blocks.filter((b) => b.sort_order !== 0);

  const dateStr =
    trip.date_start && trip.date_end
      ? `${format(new Date(trip.date_start), 'MMM d')}–${format(new Date(trip.date_end), 'd, yyyy')}`
      : '';

  const bgStyle = theme?.background_value || 'linear-gradient(168deg, #122c35 0%, #1a3d4a 12%, #2d6b5a 28%, #3a8a7a 42%, #d4a574 62%, #e8c9a0 78%, #f5e6d0 92%, #faf3eb 100%)';

  return (
    <>
      <link href={fontUrl} rel="stylesheet" />
      <div
        style={{
          minHeight: '100vh',
          background: bgStyle,
          fontFamily: `'${fontBody}', sans-serif`,
          position: 'relative',
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
        {/* Ambient glow */}
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
          {/* Collage Header */}
          <CollageHeader
            trip={trip}
            theme={theme}
            organizer={organizer}
            members={members}
            dateStr={dateStr}
            confirmedCount={confirmedCount}
          />

          <div style={{ padding: '0 20px' }}>
            {/* Organizer Card */}
            <Reveal delay={0.15}>
              <div style={{ marginTop: 16, marginBottom: 4 }}>
                <OrganizerCard organizer={organizer} />
              </div>
            </Reveal>

            {/* Countdown */}
            {trip.commit_deadline && (
              <Reveal delay={0.2}>
                <div style={{ marginTop: 14 }}>
                  <Countdown deadline={trip.commit_deadline} />
                </div>
              </Reveal>
            )}

            {/* House Card */}
            {houseBlock && (
              <Reveal delay={0.1}>
                <div style={{ marginTop: 14 }}>
                  <HouseCard block={houseBlock} confirmedCount={confirmedCount} />
                </div>
              </Reveal>
            )}

            {/* Other Blocks */}
            {otherBlocks.map((block, i) => (
              <Reveal key={block.id} delay={0.04 * i}>
                <div style={{ marginTop: 12 }}>
                  <BlockCard block={block} />
                </div>
              </Reveal>
            ))}

            {/* Cost Breakdown */}
            <Reveal delay={0.1}>
              <div style={{ marginTop: 14 }}>
                <CostBreakdown blocks={blocks} confirmedCount={confirmedCount} dateStr={dateStr} />
              </div>
            </Reveal>

            {/* Date Poll */}
            {polls.length > 0 && (
              <Reveal delay={0.05}>
                <div style={{ marginTop: 14 }}>
                  <DatePoll
                    poll={polls[0]}
                    members={members}
                  />
                </div>
              </Reveal>
            )}

            {/* Guest List */}
            <Reveal delay={0.05}>
              <div style={{ marginTop: 14 }}>
                <GuestList members={members} organizerId={organizer.id} />
              </div>
            </Reveal>

            {/* Group Chat */}
            <Reveal delay={0.05}>
              <div style={{ marginTop: 14 }}>
                <GroupChat comments={comments} tripId={trip.id} />
              </div>
            </Reveal>

            {/* RSVP */}
            <Reveal delay={0.1}>
              <div style={{ marginTop: 14 }}>
                <RsvpSection tripId={trip.id} />
              </div>
            </Reveal>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
