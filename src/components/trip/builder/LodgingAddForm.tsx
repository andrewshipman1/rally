'use client';

// LodgingAddForm — two-step flow: pick accommodation type → fill
// type-specific form → submit to addLodgingOption server action.
// Session 8A + 8B (getCopy cleanup, edit mode, crew-aware hotel
// estimate, "other" field order fix).

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging } from '@/types';
import { addLodgingOption, updateLodgingOption } from '@/app/actions/sketch-modules';

type AccommodationType = 'home_rental' | 'hotel' | 'other';

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  dateStart: string | null;
  dateEnd: string | null;
  onDone: () => void;
  editingSpot?: Lodging | null;
  crewCount?: number;
};

type OgData = {
  title: string | null;
  description: string | null;
  image: string | null;
};

function computeNights(dateStart: string | null, dateEnd: string | null): number | null {
  if (!dateStart || !dateEnd) return null;
  const start = new Date(dateStart);
  const end = new Date(dateEnd);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

export function LodgingAddForm({ themeId, tripId, slug, dateStart, dateEnd, onDone, editingSpot, crewCount }: Props) {
  const router = useRouter();
  const isEditing = !!editingSpot;

  // Pre-fill from editingSpot when in edit mode
  const [step, setStep] = useState<'pick' | 'form'>(editingSpot ? 'form' : 'pick');
  const [accomType, setAccomType] = useState<AccommodationType | null>(editingSpot?.accommodation_type ?? null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields — seeded from editingSpot when editing
  const [link, setLink] = useState(editingSpot?.link || '');
  const [title, setTitle] = useState(editingSpot?.name || '');
  const [totalPrice, setTotalPrice] = useState(editingSpot?.total_cost != null ? String(editingSpot.total_cost) : '');
  const [costPerNight, setCostPerNight] = useState(editingSpot?.cost_per_night != null ? String(editingSpot.cost_per_night) : '');
  const [peoplePerRoom, setPeoplePerRoom] = useState(editingSpot?.people_per_room != null ? String(editingSpot.people_per_room) : '');
  const [bedrooms, setBedrooms] = useState(editingSpot?.bedrooms != null ? String(editingSpot.bedrooms) : '');
  const [maxGuests, setMaxGuests] = useState(editingSpot?.max_guests != null ? String(editingSpot.max_guests) : '');
  const [ogData, setOgData] = useState<OgData | null>(
    editingSpot?.og_title || editingSpot?.og_image_url
      ? { title: editingSpot.og_title ?? null, description: editingSpot.og_description ?? null, image: editingSpot.og_image_url ?? null }
      : null
  );
  const [enriching, setEnriching] = useState(false);

  const pickType = useCallback((type: AccommodationType) => {
    setAccomType(type);
    setStep('form');
  }, []);

  const handleCancel = useCallback(() => {
    onDone();
  }, [onDone]);

  // Fire enrichment on link paste/change
  const handleLinkChange = useCallback(async (value: string) => {
    setLink(value);
    // Only enrich if it looks like a URL
    if (!value.match(/^https?:\/\/.+/)) return;
    setEnriching(true);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      const og: OgData = await res.json();
      setOgData(og);
      // Auto-fill title if empty
      if (og.title && !title) {
        setTitle(og.title);
      }
    } catch {
      // Enrichment failed — no-op, organizer fills manually
    } finally {
      setEnriching(false);
    }
  }, [title]);

  const handleSubmit = useCallback(async () => {
    if (!accomType || !title.trim()) return;
    setSubmitting(true);

    const payload = {
      name: title.trim(),
      link: link.trim() || undefined,
      ogTitle: ogData?.title || undefined,
      ogDescription: ogData?.description || undefined,
      ogImageUrl: ogData?.image || undefined,
      accommodationType: accomType,
      totalCost: totalPrice ? parseFloat(totalPrice) : undefined,
      costPerNight: costPerNight ? parseFloat(costPerNight) : undefined,
      peoplePerRoom: peoplePerRoom ? parseInt(peoplePerRoom, 10) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      maxGuests: maxGuests ? parseInt(maxGuests, 10) : undefined,
    };

    try {
      if (isEditing) {
        await updateLodgingOption(tripId, slug, editingSpot!.id, payload);
      } else {
        await addLodgingOption(tripId, slug, payload);
      }
      router.refresh();
      onDone();
    } catch {
      // Server action failed — stay on form
    } finally {
      setSubmitting(false);
    }
  }, [accomType, title, link, ogData, totalPrice, costPerNight, peoplePerRoom, bedrooms, maxGuests, tripId, slug, router, onDone, isEditing, editingSpot]);

  // ─── Step 1: Type Picker ──────────────────────────────────────
  if (step === 'pick') {
    const types: { key: AccommodationType; emojiKey: string; nameKey: string; descKey: string }[] = [
      { key: 'home_rental', emojiKey: 'lodging.emojiHomeRental', nameKey: 'lodging.typeHomeRental', descKey: 'lodging.typeHomeRentalDesc' },
      { key: 'hotel', emojiKey: 'lodging.emojiHotel', nameKey: 'lodging.typeHotel', descKey: 'lodging.typeHotelDesc' },
      { key: 'other', emojiKey: 'lodging.emojiOther', nameKey: 'lodging.typeOther', descKey: 'lodging.typeOtherDesc' },
    ];

    return (
      <div className="lodging-type-picker">
        <div className="lodging-type-picker-title">
          {getCopy(themeId, 'builderState.lodging.typePickerTitle')}
        </div>
        {types.map((t) => (
          <button
            key={t.key}
            className="lodging-type-option"
            onClick={() => pickType(t.key)}
            type="button"
          >
            <span className="lodging-type-option-emoji">
              {getCopy(themeId, `builderState.${t.emojiKey}`)}
            </span>
            <span className="lodging-type-option-text">
              <span className="lodging-type-option-name">
                {getCopy(themeId, `builderState.${t.nameKey}`)}
              </span>
              <span className="lodging-type-option-desc">
                {getCopy(themeId, `builderState.${t.descKey}`)}
              </span>
            </span>
          </button>
        ))}
        <button
          className="lodging-form-cancel"
          onClick={handleCancel}
          type="button"
        >
          {getCopy(themeId, 'builderState.lodging.cancelButton')}
        </button>
      </div>
    );
  }

  // ─── Step 2: Type-Specific Form ───────────────────────────────
  const nights = computeNights(dateStart, dateEnd);

  // Crew-aware hotel estimate
  const perRoom = peoplePerRoom ? parseInt(peoplePerRoom, 10) : 1;
  const rooms = crewCount ? Math.ceil(crewCount / perRoom) : 1;
  const hotelEstimate = accomType === 'hotel' && costPerNight && nights
    ? Math.round(parseFloat(costPerNight) * nights * rooms)
    : null;

  // Emoji for form type label
  const accomEmojiKey = accomType === 'home_rental' ? 'lodging.emojiHomeRental'
    : accomType === 'hotel' ? 'lodging.emojiHotel'
    : 'lodging.emojiOther';
  const accomNameKey = accomType === 'home_rental' ? 'lodging.typeHomeRental'
    : accomType === 'hotel' ? 'lodging.typeHotel'
    : 'lodging.typeOther';

  // Format operator copy keys
  const times = getCopy(themeId, 'builderState.lodging.timesSymbol');
  const eq = getCopy(themeId, 'builderState.lodging.equalsSymbol');
  const approx = getCopy(themeId, 'builderState.lodging.approxSymbol');

  // Shared link field renderer (used by home_rental, hotel, and other)
  const linkField = (
    <div className="lodging-form-group">
      <input
        className="lodging-form-field"
        type="url"
        value={link}
        onChange={(e) => handleLinkChange(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text');
          if (pasted) {
            e.preventDefault();
            setLink(pasted);
            handleLinkChange(pasted);
          }
        }}
        placeholder={getCopy(themeId, 'builderState.lodging.linkPlaceholder')}
      />
      {enriching && (
        <span className="lodging-form-enriching">
          {getCopy(themeId, 'builderState.lodging.enrichingIndicator')}
        </span>
      )}
      {!enriching && !ogData && link && (
        <span className="lodging-form-hint">
          {getCopy(themeId, 'builderState.lodging.linkHint')}
        </span>
      )}
    </div>
  );

  // Shared OG preview renderer
  const ogPreview = ogData?.image ? (
    <div className="lodging-form-og-preview">
      <img src={ogData.image} alt="" className="lodging-form-og-img" />
    </div>
  ) : null;

  // Shared title field renderer
  const titleField = (
    <div className="lodging-form-group">
      <input
        className="lodging-form-field"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={getCopy(themeId, 'builderState.lodging.titlePlaceholder')}
        required
      />
    </div>
  );

  return (
    <div className="lodging-form">
      <div className="lodging-form-type-label">
        {getCopy(themeId, `builderState.${accomEmojiKey}`)}{' '}
        {getCopy(themeId, `builderState.${accomNameKey}`)}
        {!isEditing && (
          <button
            className="lodging-form-change-type"
            onClick={() => { setStep('pick'); setAccomType(null); }}
            type="button"
          >
            {getCopy(themeId, 'builderState.lodging.changeType')}
          </button>
        )}
      </div>

      {/* Link field — for home_rental and hotel, appears before title */}
      {accomType !== 'other' && linkField}

      {/* OG image preview — for home_rental and hotel */}
      {accomType !== 'other' && ogPreview}

      {/* Title — for home_rental and hotel (for "other", title comes after link below) */}
      {accomType !== 'other' && titleField}

      {/* Type-specific fields */}
      {accomType === 'home_rental' && (
        <>
          <div className="lodging-form-group">
            <input
              className="lodging-form-field"
              type="number"
              inputMode="decimal"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.pricePlaceholder')}
              min="0"
              required
            />
          </div>
          <div className="lodging-form-row">
            <input
              className="lodging-form-field"
              type="number"
              inputMode="numeric"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.bedroomsPlaceholder')}
              min="0"
            />
            <input
              className="lodging-form-field"
              type="number"
              inputMode="numeric"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.maxGuestsPlaceholder')}
              min="0"
            />
          </div>
        </>
      )}

      {accomType === 'hotel' && (
        <>
          <div className="lodging-form-group">
            <input
              className="lodging-form-field"
              type="number"
              inputMode="decimal"
              value={costPerNight}
              onChange={(e) => setCostPerNight(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.costPerNightPlaceholder')}
              min="0"
              required
            />
          </div>
          <div className="lodging-form-group">
            <input
              className="lodging-form-field"
              type="number"
              inputMode="numeric"
              value={peoplePerRoom}
              onChange={(e) => setPeoplePerRoom(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.peoplePerRoomPlaceholder')}
              min="1"
              required
            />
            <span className="lodging-form-hint">
              {getCopy(themeId, 'builderState.lodging.peoplePerRoomHint')}
            </span>
          </div>
          {/* Computed estimate — crew-aware */}
          <div className="lodging-form-estimate">
            {hotelEstimate !== null
              ? `$${costPerNight}${getCopy(themeId, 'builderState.lodging.perNightLabel')} ${times} ${nights} ${getCopy(themeId, 'builderState.lodging.nightsLabel')}${rooms > 1 ? ` ${times} ${rooms} ${getCopy(themeId, 'builderState.lodging.roomsLabel')}` : ''} ${eq} ${approx}$${hotelEstimate.toLocaleString()}`
              : costPerNight
                ? `$${costPerNight}${getCopy(themeId, 'builderState.lodging.perNightLabel')} ${times} ? ${getCopy(themeId, 'builderState.lodging.nightsLabel')}`
                : ''}
          </div>
        </>
      )}

      {accomType === 'other' && (
        <>
          {/* Link first — triggers enrichment that auto-fills title */}
          {linkField}
          {ogPreview}
          {/* Title — after link so enrichment fires first */}
          {titleField}
          <div className="lodging-form-group">
            <input
              className="lodging-form-field"
              type="number"
              inputMode="decimal"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder={getCopy(themeId, 'builderState.lodging.pricePlaceholder')}
              min="0"
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="lodging-form-actions">
        <button
          className="lodging-form-submit"
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          type="button"
        >
          {getCopy(themeId, isEditing ? 'builderState.lodging.editButton' : 'builderState.lodging.addButton')}
        </button>
        <button
          className="lodging-form-cancel"
          onClick={handleCancel}
          disabled={submitting}
          type="button"
        >
          {getCopy(themeId, 'builderState.lodging.cancelButton')}
        </button>
      </div>
    </div>
  );
}
