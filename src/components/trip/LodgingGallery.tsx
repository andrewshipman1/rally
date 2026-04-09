'use client';

// LodgingGallery — interactive voting gallery (Session 3C).
//
// Replaces the read-only gallery from Session 1. Each card now shows
// vote tallies, vote/change buttons, and (for organizers) a lock button.
// All user-facing strings go through getCopy().

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Lodging, LodgingVote, User } from '@/types';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import { castLodgingVote, lockLodgingWinner } from '@/app/actions/lodging';

type LodgingWithVotes = Lodging & { votes: (LodgingVote & { user: User })[] };

type Props = {
  themeId: ThemeId;
  lodging: LodgingWithVotes[];
  currentUserId: string | null;
  isOrganizer: boolean;
  slug: string;
  tripId: string;
  votingLocked: boolean;
};

export function LodgingGallery({
  themeId,
  lodging,
  currentUserId,
  isOrganizer,
  slug,
  tripId,
  votingLocked,
}: Props) {
  if (lodging.length === 0) {
    return (
      <div className="lodging-gallery">
        <h2 className="section-h2">{getCopy(themeId, 'tripPageShared.lodging.h2')}</h2>
        <div className="lodging-empty">{getCopy(themeId, 'lodgingVoting.empty')}</div>
      </div>
    );
  }

  const title = votingLocked
    ? getCopy(themeId, 'lodgingVoting.card.title.locked')
    : getCopy(themeId, 'lodgingVoting.card.title.open');

  const totalVotes = lodging.reduce((sum, l) => sum + l.votes.length, 0);

  return (
    <section className="lodging-gallery">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
        <h2 className="section-h2" style={{ flex: 1, margin: 0 }}>{title}</h2>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            background: votingLocked ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
            color: votingLocked ? 'var(--surface)' : 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {votingLocked
            ? getCopy(themeId, 'lodgingVoting.pill.locked')
            : getCopy(themeId, 'lodgingVoting.pill.open')}
        </span>
      </div>
      <div className="lodging-gallery-grid">
        {lodging.map((spot) => (
          <LodgingCard
            key={spot.id}
            spot={spot}
            allLodging={lodging}
            themeId={themeId}
            currentUserId={currentUserId}
            isOrganizer={isOrganizer}
            slug={slug}
            tripId={tripId}
            votingLocked={votingLocked}
            totalVotes={totalVotes}
          />
        ))}
      </div>
    </section>
  );
}

function LodgingCard({
  spot,
  allLodging,
  themeId,
  currentUserId,
  isOrganizer,
  slug,
  tripId,
  votingLocked,
  totalVotes,
}: {
  spot: LodgingWithVotes;
  allLodging: LodgingWithVotes[];
  themeId: ThemeId;
  currentUserId: string | null;
  isOrganizer: boolean;
  slug: string;
  tripId: string;
  votingLocked: boolean;
  totalVotes: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const userVotedHere = currentUserId
    ? spot.votes.some((v) => v.user_id === currentUserId)
    : false;
  const userVotedAnywhere = currentUserId
    ? allLodging.some((l) => l.votes.some((v) => v.user_id === currentUserId))
    : false;

  const handleVote = () => {
    if (!currentUserId || votingLocked) return;
    startTransition(async () => {
      const res = await castLodgingVote(tripId, slug, spot.id);
      if (res.ok) router.refresh();
    });
  };

  const handleLock = () => {
    if (!isOrganizer) return;
    startTransition(async () => {
      const res = await lockLodgingWinner(tripId, slug, spot.id);
      if (res.ok) router.refresh();
    });
  };

  const href = spot.link || '#';
  const meta =
    spot.cost_per_night
      ? `$${spot.cost_per_night}/night`
      : spot.address ?? null;

  // Vote tally text
  const tallyText =
    spot.votes.length > 0
      ? getCopy(themeId, 'lodgingVoting.tally', { n: spot.votes.length })
      : getCopy(themeId, 'lodgingVoting.tally.zero');

  // Voter names
  let voterText: string | null = null;
  if (spot.votes.length > 0) {
    const names = spot.votes.map((v) => v.user?.display_name ?? '?');
    if (names.length <= 2) {
      voterText = names.join(', ');
    } else {
      voterText = getCopy(themeId, 'lodgingVoting.voters', {
        name1: names[0],
        name2: names[1],
        n: names.length - 2,
      });
    }
  }

  return (
    <div className="house" style={{ display: 'block', textDecoration: 'none' }}>
      <a
        href={href}
        target={spot.link ? '_blank' : undefined}
        rel={spot.link ? 'noopener noreferrer' : undefined}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <div className="house-img" style={{ position: 'relative' }}>
          {votingLocked && spot.is_selected && (
            <div className="house-flag">
              {getCopy(themeId, 'lodgingVoting.winnerStamp')}
            </div>
          )}
          {votingLocked && !spot.is_selected && (
            <div
              className="house-flag"
              style={{ opacity: 0.6 }}
            >
              {getCopy(themeId, 'lodgingVoting.loserLabel')}
            </div>
          )}
          {spot.og_image_url && (
            <Image
              src={spot.og_image_url}
              alt={`Photo of ${spot.name}`}
              fill
              sizes="(max-width: 420px) 100vw, 200px"
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          )}
        </div>
        <div className="house-body">
          <div className="house-title">{spot.name}</div>
          {meta && <div className="house-meta">{meta}</div>}
        </div>
      </a>

      {/* Vote tally + voter names */}
      <div style={{ padding: '6px 12px 4px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
        <span>{tallyText}</span>
        {voterText && (
          <span style={{ marginLeft: 6, fontSize: 11 }}>· {voterText}</span>
        )}
      </div>

      {/* Vote / lock buttons */}
      <div style={{ padding: '0 12px 12px', display: 'flex', gap: 6 }}>
        {!votingLocked && currentUserId && (
          <button
            onClick={handleVote}
            disabled={pending}
            aria-label={`Vote for ${spot.name}${userVotedHere ? ' (voted)' : ''}`}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              border: userVotedHere
                ? '1px solid var(--accent)'
                : '1px solid rgba(255,255,255,0.15)',
              background: userVotedHere
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(255,255,255,0.05)',
              color: userVotedHere ? 'var(--accent)' : '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              opacity: pending ? 0.5 : 1,
            }}
          >
            {userVotedHere
              ? getCopy(themeId, 'lodgingVoting.vote.cta.voted')
              : userVotedAnywhere
                ? getCopy(themeId, 'lodgingVoting.vote.changeCta')
                : getCopy(themeId, 'lodgingVoting.vote.cta')}
          </button>
        )}

        {!votingLocked && isOrganizer && (
          <button
            onClick={handleLock}
            disabled={pending || totalVotes < 2}
            aria-label={`Lock ${spot.name} as winner`}
            title={totalVotes < 2 ? getCopy(themeId, 'lodgingVoting.organizer.lockDisabledTooltip') : undefined}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: totalVotes < 2 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: pending || totalVotes < 2 ? 0.4 : 1,
            }}
          >
            {getCopy(themeId, 'lodgingVoting.organizer.lockCta')}
          </button>
        )}
      </div>
    </div>
  );
}
