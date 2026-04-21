'use client';

// LodgingCard — .house-style card for a lodging option.
// One component, two modes: sketch (edit affordances) and sell (voting).
// Presence of the `voting` prop is the discriminator — absent = sketch
// mode (current behavior), present = sell mode (hide edit affordances,
// show tally + vote/lock + winner/losing flag).

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, LodgingVote, User } from '@/types';
import { removeLodgingOption } from '@/app/actions/sketch-modules';
import { castLodgingVote, lockLodgingWinner } from '@/app/actions/lodging';

type LodgingWithVotes = Lodging & { votes: (LodgingVote & { user: User })[] };

type Props = {
  spot: Lodging;
  themeId: ThemeId;
  tripId: string;
  slug: string;
  dateStart: string | null;
  dateEnd: string | null;
  onEdit?: (spot: Lodging) => void;
  crewCount?: number;
  voting?: {
    currentUserId: string | null;
    isOrganizer: boolean;
    votingLocked: boolean;
    votes: (LodgingVote & { user: User })[];
    allLodging: LodgingWithVotes[];
    totalVotes: number;
  };
};

function computeNights(dateStart: string | null, dateEnd: string | null): number | null {
  if (!dateStart || !dateEnd) return null;
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export function LodgingCard({ spot, themeId, tripId, slug, dateStart, dateEnd, onEdit, crewCount, voting }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const isSellMode = voting !== undefined;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await removeLodgingOption(tripId, slug, spot.id);
      router.refresh();
    });
  };

  const handleEdit = () => {
    if (isSellMode) return;
    if (onEdit) onEdit(spot);
  };

  const handleVote = () => {
    if (!voting || !voting.currentUserId || voting.votingLocked) return;
    startTransition(async () => {
      const res = await castLodgingVote(tripId, slug, spot.id);
      if (res.ok) router.refresh();
    });
  };

  const handleLock = () => {
    if (!voting || !voting.isOrganizer) return;
    startTransition(async () => {
      const res = await lockLodgingWinner(tripId, slug, spot.id);
      if (res.ok) router.refresh();
    });
  };

  const nights = computeNights(dateStart, dateEnd);
  const imageUrl = spot.og_image_url;

  // Emoji + type name via getCopy
  const emojiKey = spot.accommodation_type === 'home_rental' ? 'lodging.emojiHomeRental'
    : spot.accommodation_type === 'hotel' ? 'lodging.emojiHotel'
    : 'lodging.emojiOther';
  const typeNameKey = spot.accommodation_type === 'home_rental' ? 'lodging.typeHomeRental'
    : spot.accommodation_type === 'hotel' ? 'lodging.typeHotel'
    : 'lodging.typeOther';
  const typeBadge = `${getCopy(themeId, `builderState.${emojiKey}`)} ${getCopy(themeId, `builderState.${typeNameKey}`)}`;

  // Cost display varies by type. Also compute a group-level total so
  // the per-person tail (Session 9J) can derive the same dollars the
  // primary line is already showing — kept in sync by construction.
  let costLine: string | null = null;
  let groupTotalForSplit: number | null = null;
  if (spot.accommodation_type === 'home_rental') {
    if (spot.total_cost != null && spot.total_cost > 0) {
      costLine = `$${spot.total_cost.toLocaleString()} ${getCopy(themeId, 'builderState.lodging.totalLabel')}`;
      groupTotalForSplit = spot.total_cost;
    }
  } else if (spot.accommodation_type === 'hotel') {
    if (spot.cost_per_night != null) {
      const perRoom = spot.people_per_room || 1;
      const rooms = crewCount ? Math.ceil(crewCount / perRoom) : 1;
      const times = getCopy(themeId, 'builderState.lodging.timesSymbol');
      const eq = getCopy(themeId, 'builderState.lodging.equalsSymbol');
      const approx = getCopy(themeId, 'builderState.lodging.approxSymbol');
      if (nights) {
        const estimate = Math.round(spot.cost_per_night * nights * rooms);
        const roomsPart = rooms > 1 ? ` ${times} ${rooms} ${getCopy(themeId, 'builderState.lodging.roomsLabel')}` : '';
        costLine = `$${spot.cost_per_night}${getCopy(themeId, 'builderState.lodging.perNightLabel')} ${times} ${nights} ${getCopy(themeId, 'builderState.lodging.nightsLabel')}${roomsPart} ${eq} ${approx}$${estimate.toLocaleString()}`;
        groupTotalForSplit = estimate;
      } else {
        costLine = `$${spot.cost_per_night}${getCopy(themeId, 'builderState.lodging.perNightLabel')}`;
      }
    }
  } else {
    // Other
    if (spot.total_cost != null && spot.total_cost > 0) {
      costLine = `$${spot.total_cost.toLocaleString()} ${getCopy(themeId, 'builderState.lodging.totalLabel')}`;
      groupTotalForSplit = spot.total_cost;
    } else {
      costLine = getCopy(themeId, 'builderState.lodging.freeLabel');
    }
  }

  // Per-person tail (Session 9J). Hidden when: no split (< 2 crew),
  // no group total (free / rate-only hotel), or result would be <$1.
  const splitCount = crewCount && crewCount > 1 ? crewCount : null;
  const perPersonTotal = splitCount && groupTotalForSplit
    ? Math.round(groupTotalForSplit / splitCount)
    : null;
  const perPersonLine = (splitCount && perPersonTotal != null && perPersonTotal > 0)
    ? `${getCopy(themeId, 'builderState.lodging.divideSymbol')} ${splitCount} ${getCopy(themeId, 'builderState.lodging.equalsSymbol')} ${getCopy(themeId, 'builderState.lodging.approxSymbol')}$${perPersonTotal.toLocaleString()}${getCopy(themeId, 'builderState.lodging.perPersonLabel')}`
    : null;

  // Meta line
  let metaParts: string[] = [];
  if (spot.accommodation_type === 'home_rental') {
    if (spot.bedrooms) metaParts.push(`${spot.bedrooms} ${getCopy(themeId, 'builderState.lodging.bedroomsLabel')}`);
    if (spot.max_guests) metaParts.push(`${spot.max_guests} ${getCopy(themeId, 'builderState.lodging.maxGuestsLabel')}`);
  } else if (spot.accommodation_type === 'hotel' && spot.people_per_room) {
    metaParts.push(`${spot.people_per_room} ${getCopy(themeId, 'builderState.lodging.perRoomLabel')}`);
  }
  const metaLine = metaParts.length > 0 ? metaParts.join(getCopy(themeId, 'builderState.lodging.separatorDot')) : null;

  // Sell-mode voting derived values
  const userVotedHere = voting?.currentUserId
    ? voting.votes.some((v) => v.user_id === voting.currentUserId)
    : false;
  const userVotedAnywhere = voting?.currentUserId
    ? voting.allLodging.some((l) => l.votes.some((v) => v.user_id === voting.currentUserId))
    : false;

  const tallyText = voting
    ? voting.votes.length > 0
      ? getCopy(themeId, 'lodgingVoting.tally', { n: voting.votes.length })
      : getCopy(themeId, 'lodgingVoting.tally.zero')
    : null;

  let voterText: string | null = null;
  if (voting && voting.votes.length > 0) {
    const names = voting.votes.map((v) => v.user?.display_name ?? '?');
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

  const canClickEdit = !isSellMode && !!onEdit;

  return (
    <div
      className="house lodging-card"
      style={{ opacity: pending ? 0.5 : 1, cursor: canClickEdit ? 'pointer' : 'default' }}
      onClick={canClickEdit ? handleEdit : undefined}
    >
      {/* Image header */}
      <div className="house-img" style={{ position: 'relative' }}>
        {/* Sketch-only: type badge + remove button */}
        {!isSellMode && (
          <>
            <div className="house-flag lodging-type-badge">{typeBadge}</div>
            <button
              className="lodging-remove-btn"
              onClick={handleRemove}
              disabled={pending}
              type="button"
              aria-label={`Remove ${spot.name}`}
            >
              {getCopy(themeId, 'builderState.lodging.closeSymbol')}
            </button>
          </>
        )}

        {/* Sell-only: winner / losing flag when voting is locked */}
        {isSellMode && voting!.votingLocked && spot.is_selected && (
          <div className="lodging-vote-flag winner">
            {getCopy(themeId, 'lodgingVoting.winnerStamp')}
          </div>
        )}
        {isSellMode && voting!.votingLocked && !spot.is_selected && (
          <div className="lodging-vote-flag losing">
            {getCopy(themeId, 'lodgingVoting.loserLabel')}
          </div>
        )}

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Photo of ${spot.name}`}
            fill
            sizes="(max-width: 420px) 100vw, 400px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div className="lodging-img-placeholder">
            {getCopy(themeId, `builderState.${emojiKey}`)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="house-body">
        <div className="house-title">{spot.name}</div>
        {costLine && <div className="house-meta">{costLine}</div>}
        {perPersonLine && <div className="lodging-card-per-person">{perPersonLine}</div>}
        {metaLine && <div className="lodging-card-meta">{metaLine}</div>}

        {/* Prominent link */}
        {spot.link && (
          <a
            href={spot.link}
            target="_blank"
            rel="noopener noreferrer"
            className="lodging-link-pill"
            onClick={(e) => e.stopPropagation()}
          >
            {getCopy(themeId, 'builderState.lodging.viewListing')}
          </a>
        )}
      </div>

      {/* Sell-only: tally line */}
      {isSellMode && tallyText && (
        <div className="tally-line">
          <span>{tallyText}</span>
          {voterText && <span className="voters">· {voterText}</span>}
        </div>
      )}

      {/* Sell-only: vote / lock row (hidden when voting is locked) */}
      {isSellMode && !voting!.votingLocked && (voting!.currentUserId || voting!.isOrganizer) && (
        <div className="vote-row">
          {voting!.currentUserId && (
            <button
              className="btn-vote"
              data-voted={userVotedHere ? 'true' : undefined}
              onClick={handleVote}
              disabled={pending}
              aria-label={`Vote for ${spot.name}${userVotedHere ? ' (voted)' : ''}`}
              type="button"
            >
              {userVotedHere
                ? getCopy(themeId, 'lodgingVoting.vote.cta.voted')
                : userVotedAnywhere
                  ? getCopy(themeId, 'lodgingVoting.vote.changeCta')
                  : getCopy(themeId, 'lodgingVoting.vote.cta')}
            </button>
          )}
          {voting!.isOrganizer && (
            <button
              className="btn-lock"
              onClick={handleLock}
              disabled={pending || voting!.totalVotes < 2}
              title={voting!.totalVotes < 2 ? getCopy(themeId, 'lodgingVoting.organizer.lockDisabledTooltip') : undefined}
              aria-label={`Lock ${spot.name} as winner`}
              type="button"
            >
              {getCopy(themeId, 'lodgingVoting.organizer.lockCta')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
