'use server';

// Server actions for sketch-phase module inputs. Each action inserts
// a record into the module's existing table, gated on organizer auth.
// Follows the same pattern as extras.ts (Zod + organizerPrelude).

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type Result = { ok: true } | { ok: false; error: string };

// ─── Shared prelude ───────────────────────────────────────────────

async function organizerPrelude(tripId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'not-authenticated' };

  const { data: trip, error: fetchError } = await supabase
    .from('trips')
    .select('organizer_id')
    .eq('id', tripId)
    .single();
  if (fetchError || !trip) return { ok: false as const, error: 'trip-not-found' };
  if (trip.organizer_id !== user.id) return { ok: false as const, error: 'not-organizer' };

  return { ok: true as const, supabase, user };
}

// ─── Schemas ──────────────────────────────────────────────────────

const AddLodgingSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1).max(500),
  link: z.string().max(2000).optional(),
  ogTitle: z.string().max(500).optional(),
  ogDescription: z.string().max(2000).optional(),
  ogImageUrl: z.string().max(2000).optional(),
  accommodationType: z.enum(['home_rental', 'hotel', 'other']),
  costPerNight: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  peoplePerRoom: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(0).optional(),
});

const RemoveLodgingSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  lodgingId: z.string().uuid(),
});

const UpdateLodgingSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  lodgingId: z.string().uuid(),
  name: z.string().min(1).max(500),
  link: z.string().max(2000).optional(),
  ogTitle: z.string().max(500).optional(),
  ogDescription: z.string().max(2000).optional(),
  ogImageUrl: z.string().max(2000).optional(),
  accommodationType: z.enum(['home_rental', 'hotel', 'other']),
  costPerNight: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  peoplePerRoom: z.number().int().min(1).optional(),
  bedrooms: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(0).optional(),
});

const AddLineItemSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1).max(500),
  cost: z.number().min(0).optional(),
});

const SetProvisionsSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  estimatedTotal: z.number().min(0),
});

// Session 8P — "other" row in the merged everything-else module. Same
// shape as provisions; upsert-by-name against the shared groceries table.
const SetOtherSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  estimatedTotal: z.number().min(0),
});

// ─── Lodging ──────────────────────────────────────────────────────

export async function addLodgingOption(
  tripId: string,
  slug: string,
  data: {
    name: string;
    link?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    accommodationType: 'home_rental' | 'hotel' | 'other';
    costPerNight?: number;
    totalCost?: number;
    peoplePerRoom?: number;
    bedrooms?: number;
    maxGuests?: number;
  },
): Promise<Result> {
  const parsed = AddLodgingSchema.safeParse({ tripId, slug, ...data });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('lodging')
    .insert({
      trip_id: tripId,
      name: data.name,
      link: data.link || null,
      og_title: data.ogTitle || null,
      og_description: data.ogDescription || null,
      og_image_url: data.ogImageUrl || null,
      accommodation_type: data.accommodationType,
      cost_per_night: data.costPerNight ?? null,
      total_cost: data.totalCost ?? null,
      people_per_room: data.peoplePerRoom ?? null,
      bedrooms: data.bedrooms ?? null,
      max_guests: data.maxGuests ?? null,
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function removeLodgingOption(
  tripId: string,
  slug: string,
  lodgingId: string,
): Promise<Result> {
  const parsed = RemoveLodgingSchema.safeParse({ tripId, slug, lodgingId });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('lodging')
    .delete()
    .eq('id', lodgingId)
    .eq('trip_id', tripId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function updateLodgingOption(
  tripId: string,
  slug: string,
  lodgingId: string,
  data: {
    name: string;
    link?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    accommodationType: 'home_rental' | 'hotel' | 'other';
    costPerNight?: number;
    totalCost?: number;
    peoplePerRoom?: number;
    bedrooms?: number;
    maxGuests?: number;
  },
): Promise<Result> {
  const parsed = UpdateLodgingSchema.safeParse({ tripId, slug, lodgingId, ...data });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('lodging')
    .update({
      name: data.name,
      link: data.link || null,
      og_title: data.ogTitle || null,
      og_description: data.ogDescription || null,
      og_image_url: data.ogImageUrl || null,
      accommodation_type: data.accommodationType,
      cost_per_night: data.costPerNight ?? null,
      total_cost: data.totalCost ?? null,
      people_per_room: data.peoplePerRoom ?? null,
      bedrooms: data.bedrooms ?? null,
      max_guests: data.maxGuests ?? null,
    })
    .eq('id', lodgingId)
    .eq('trip_id', tripId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Flights ──────────────────────────────────────────────────────

export async function addFlight(
  tripId: string,
  slug: string,
  name: string,
  cost?: number,
): Promise<Result> {
  const parsed = AddLineItemSchema.safeParse({ tripId, slug, name, cost });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('flights')
    .insert({
      trip_id: tripId,
      departure_airport: name,
      estimated_price: cost ?? null,
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Transportation (Session 8M) ──────────────────────────────────
// Rebuilt against rally-transportation-wireframe.html. Writes the new
// 7-value type_tag + canonical description column. Legacy `subtype`
// column is left NULL on new rows (it stays nullable; old rows keep
// their backfilled value from migration 019).

const TransportTypeTagSchema = z.enum([
  'flight',
  'train',
  'rental_car_van',
  'charter_van_bus',
  'charter_boat',
  'ferry',
  'other',
]);

const TransportPayloadSchema = z.object({
  type_tag: TransportTypeTagSchema,
  description: z.string().min(1).max(200),
  estimated_total: z.number().min(0),
  cost_type: z.enum(['individual', 'shared']),
  booking_link: z.string().max(2000).optional().nullable(),
  og_image_url: z.string().max(2000).optional().nullable(),
});

const AddTransportSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  payload: TransportPayloadSchema,
});

const UpdateTransportSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  transportId: z.string().uuid(),
  payload: TransportPayloadSchema,
});

const RemoveTransportSchema = z.object({
  tripId: z.string().uuid(),
  slug: z.string().min(1),
  transportId: z.string().uuid(),
});

export type TransportPayload = z.infer<typeof TransportPayloadSchema>;

export async function addTransport(
  tripId: string,
  slug: string,
  payload: TransportPayload,
): Promise<Result> {
  const parsed = AddTransportSchema.safeParse({ tripId, slug, payload });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('transport')
    .insert({
      trip_id: tripId,
      type_tag: payload.type_tag,
      description: payload.description,
      estimated_total: payload.estimated_total,
      cost_type: payload.cost_type,
      booking_link: payload.booking_link || null,
      og_image_url: payload.og_image_url || null,
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function updateTransport(
  tripId: string,
  slug: string,
  transportId: string,
  payload: TransportPayload,
): Promise<Result> {
  const parsed = UpdateTransportSchema.safeParse({ tripId, slug, transportId, payload });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('transport')
    .update({
      type_tag: payload.type_tag,
      description: payload.description,
      estimated_total: payload.estimated_total,
      cost_type: payload.cost_type,
      booking_link: payload.booking_link || null,
      og_image_url: payload.og_image_url || null,
    })
    .eq('id', transportId)
    .eq('trip_id', tripId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

export async function removeTransport(
  tripId: string,
  slug: string,
  transportId: string,
): Promise<Result> {
  const parsed = RemoveTransportSchema.safeParse({ tripId, slug, transportId });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('transport')
    .delete()
    .eq('id', transportId)
    .eq('trip_id', tripId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Activities ───────────────────────────────────────────────────

export async function addActivity(
  tripId: string,
  slug: string,
  name: string,
  cost?: number,
): Promise<Result> {
  const parsed = AddLineItemSchema.safeParse({ tripId, slug, name, cost });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { error } = await pre.supabase
    .from('activities')
    .insert({
      trip_id: tripId,
      name,
      estimated_cost: cost ?? null,
    });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Provisions ───────────────────────────────────────────────────

export async function setProvisionsEstimate(
  tripId: string,
  slug: string,
  estimatedTotal: number,
): Promise<Result> {
  const parsed = SetProvisionsSchema.safeParse({ tripId, slug, estimatedTotal });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  // Upsert: update if a provisions record already exists, else insert.
  const { data: existing } = await pre.supabase
    .from('groceries')
    .select('id')
    .eq('trip_id', tripId)
    .eq('name', 'Provisions')
    .maybeSingle();

  if (existing) {
    const { error } = await pre.supabase
      .from('groceries')
      .update({ estimated_total: estimatedTotal })
      .eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await pre.supabase
      .from('groceries')
      .insert({
        trip_id: tripId,
        name: 'Provisions',
        estimated_total: estimatedTotal,
        cost_type: 'shared',
      });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}

// ─── Other (Session 8P) ───────────────────────────────────────────
// Mirrors setProvisionsEstimate exactly — upsert by name on the shared
// groceries table. calculateTripCost sums every shared grocery row, so
// this contributes to per-person cost via the same divisor math as
// provisions. No migration needed.

export async function setOtherEstimate(
  tripId: string,
  slug: string,
  estimatedTotal: number,
): Promise<Result> {
  const parsed = SetOtherSchema.safeParse({ tripId, slug, estimatedTotal });
  if (!parsed.success) return { ok: false, error: 'invalid-input' };

  const pre = await organizerPrelude(tripId);
  if (!pre.ok) return { ok: false, error: pre.error };

  const { data: existing } = await pre.supabase
    .from('groceries')
    .select('id')
    .eq('trip_id', tripId)
    .eq('name', 'Other')
    .maybeSingle();

  if (existing) {
    const { error } = await pre.supabase
      .from('groceries')
      .update({ estimated_total: estimatedTotal })
      .eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await pre.supabase
      .from('groceries')
      .insert({
        trip_id: tripId,
        name: 'Other',
        estimated_total: estimatedTotal,
        cost_type: 'shared',
      });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/trip/${slug}`);
  return { ok: true };
}
