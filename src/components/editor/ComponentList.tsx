'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Lodging, Flight, Transport, Restaurant, Activity, Grocery, TransportSubtype } from '@/types';
import { AirportInput } from './AirportInput';
import { PlacesInput } from './PlacesInput';
import { stripHtml } from '@/lib/sanitize';

function parseCost(s: string): number | null {
  if (!s) return null;
  const n = parseFloat(s);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return null;
  return n;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ComponentType = 'lodging' | 'flight' | 'transport' | 'restaurant' | 'activity' | 'grocery';

const COMPONENT_META: Record<ComponentType, { label: string; emoji: string; description: string }> = {
  lodging:    { label: 'Lodging',    emoji: '🏠', description: 'House, hotel, Airbnb — supports multiple options for voting' },
  flight:     { label: 'Flight',     emoji: '✈️', description: 'Flight route with estimated price' },
  transport:  { label: 'Transport',  emoji: '🚗', description: 'Rental car, taxi, or public transit' },
  restaurant: { label: 'Restaurant', emoji: '🍽️', description: 'Reservation or group dinner' },
  activity:   { label: 'Activity',   emoji: '🤿', description: 'Excursion, tour, yoga class, etc.' },
  grocery:    { label: 'Groceries',  emoji: '🛒', description: 'Grocery run with estimated total' },
};

export function ComponentList({
  tripId,
  lodging,
  flights,
  transport,
  restaurants,
  activities,
  groceries,
  onLodgingChange,
  onFlightsChange,
  onTransportChange,
  onRestaurantsChange,
  onActivitiesChange,
  onGroceriesChange,
}: {
  tripId: string;
  lodging: Lodging[];
  flights: Flight[];
  transport: Transport[];
  restaurants: Restaurant[];
  activities: Activity[];
  groceries: Grocery[];
  onLodgingChange: (v: Lodging[]) => void;
  onFlightsChange: (v: Flight[]) => void;
  onTransportChange: (v: Transport[]) => void;
  onRestaurantsChange: (v: Restaurant[]) => void;
  onActivitiesChange: (v: Activity[]) => void;
  onGroceriesChange: (v: Grocery[]) => void;
}) {
  const [addingType, setAddingType] = useState<ComponentType | null>(null);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 18,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 6,
          }}
        >
          🧳 What&apos;s the trip?
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
          Add the house, flights, activities, and anything else.
        </div>
      </div>

      {/* Existing components — grouped by type */}
      {lodging.length > 0 && (
        <Section title="Lodging" emoji="🏠">
          {lodging.map((l) => (
            <RowItem
              key={l.id}
              primary={l.name}
              secondary={`$${l.cost_per_night || '?'}/night${l.is_selected ? ' · ✨ Picked' : ''}`}
              thumb={l.og_image_url}
              onDelete={async () => {
                if (!confirm('Remove this lodging option?')) return;
                await supabase.from('lodging').delete().eq('id', l.id);
                onLodgingChange(lodging.filter((x) => x.id !== l.id));
              }}
            />
          ))}
        </Section>
      )}

      {flights.length > 0 && (
        <Section title="Flights" emoji="✈️">
          {flights.map((f) => (
            <RowItem
              key={f.id}
              primary={`${f.departure_airport} → ${f.arrival_airport}`}
              secondary={`~$${f.estimated_price || '?'} per person${f.airline ? ' · ' + f.airline : ''}`}
              onDelete={async () => {
                if (!confirm('Remove this flight?')) return;
                await supabase.from('flights').delete().eq('id', f.id);
                onFlightsChange(flights.filter((x) => x.id !== f.id));
              }}
            />
          ))}
        </Section>
      )}

      {transport.length > 0 && (
        <Section title="Transport" emoji="🚗">
          {transport.map((t) => (
            <RowItem
              key={t.id}
              primary={t.provider || t.subtype.replace('_', ' ')}
              secondary={`~$${t.estimated_total || '?'} · ${t.cost_type === 'shared' ? 'Split' : 'Individual'}`}
              onDelete={async () => {
                if (!confirm('Remove this transport?')) return;
                await supabase.from('transport').delete().eq('id', t.id);
                onTransportChange(transport.filter((x) => x.id !== t.id));
              }}
            />
          ))}
        </Section>
      )}

      {activities.length > 0 && (
        <Section title="Activities" emoji="🤿">
          {activities.map((a) => (
            <RowItem
              key={a.id}
              primary={a.name}
              secondary={`~$${a.estimated_cost || '?'} · ${a.cost_type === 'shared' ? 'Split' : 'Individual'}`}
              thumb={a.og_image_url}
              onDelete={async () => {
                if (!confirm('Remove this activity?')) return;
                await supabase.from('activities').delete().eq('id', a.id);
                onActivitiesChange(activities.filter((x) => x.id !== a.id));
              }}
            />
          ))}
        </Section>
      )}

      {groceries.length > 0 && (
        <Section title="Groceries" emoji="🛒">
          {groceries.map((g) => (
            <RowItem
              key={g.id}
              primary={g.name}
              secondary={`~$${g.estimated_total || '?'} · ${g.cost_type === 'shared' ? 'Split' : 'Individual'}`}
              onDelete={async () => {
                if (!confirm('Remove this grocery run?')) return;
                await supabase.from('groceries').delete().eq('id', g.id);
                onGroceriesChange(groceries.filter((x) => x.id !== g.id));
              }}
            />
          ))}
        </Section>
      )}

      {restaurants.length > 0 && (
        <Section title="Restaurants" emoji="🍽️">
          {restaurants.map((r) => (
            <RowItem
              key={r.id}
              primary={r.name}
              secondary={r.cost_per_person ? `~$${r.cost_per_person} per person` : 'No cost set'}
              thumb={r.og_image_url}
              onDelete={async () => {
                if (!confirm('Remove this restaurant?')) return;
                await supabase.from('restaurants').delete().eq('id', r.id);
                onRestaurantsChange(restaurants.filter((x) => x.id !== r.id));
              }}
            />
          ))}
        </Section>
      )}

      {/* Empty state */}
      {lodging.length === 0 &&
        flights.length === 0 &&
        transport.length === 0 &&
        restaurants.length === 0 &&
        activities.length === 0 &&
        groceries.length === 0 &&
        !addingType && (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 0',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px dashed rgba(255,255,255,0.15)',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>🧳</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Nothing added yet</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Start with lodging, then add flights and activities
            </div>
          </div>
        )}

      {/* Add component buttons or form */}
      {!addingType ? (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Add to trip
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {(Object.keys(COMPONENT_META) as ComponentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setAddingType(type)}
                style={{
                  padding: '12px 4px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 22 }}>{COMPONENT_META[type].emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>
                  {COMPONENT_META[type].label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <AddForm
          type={addingType}
          tripId={tripId}
          onCancel={() => setAddingType(null)}
          onAdded={(type, item) => {
            if (type === 'lodging') onLodgingChange([...lodging, item as Lodging]);
            if (type === 'flight') onFlightsChange([...flights, item as Flight]);
            if (type === 'transport') onTransportChange([...transport, item as Transport]);
            if (type === 'restaurant') onRestaurantsChange([...restaurants, item as Restaurant]);
            if (type === 'activity') onActivitiesChange([...activities, item as Activity]);
            if (type === 'grocery') onGroceriesChange([...groceries, item as Grocery]);
            setAddingType(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Helper components ───

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        {emoji} {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function RowItem({
  primary,
  secondary,
  thumb,
  onDelete,
}: {
  primary: string;
  secondary: string;
  thumb?: string | null;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {thumb && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: `url(${thumb}) center/cover`,
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {primary}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{secondary}</div>
      </div>
      <button
        onClick={onDelete}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 14,
          color: 'rgba(255,255,255,0.4)',
          padding: '4px 8px',
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Add form ───

function AddForm({
  type,
  tripId,
  onCancel,
  onAdded,
}: {
  type: ComponentType;
  tripId: string;
  onCancel: () => void;
  onAdded: (type: ComponentType, item: Lodging | Flight | Transport | Restaurant | Activity | Grocery) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);

  // Shared fields
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  // Address (lodging, restaurant, activity)
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Lodging
  const [costPerNight, setCostPerNight] = useState('');
  const [ogImage, setOgImage] = useState<string | null>(null);

  // Flight
  const [depAirport, setDepAirport] = useState('');
  const [arrAirport, setArrAirport] = useState('');
  const [flightPrice, setFlightPrice] = useState('');

  // Transport
  const [subtype, setSubtype] = useState<TransportSubtype>('car_rental');
  const [transportTotal, setTransportTotal] = useState('');
  const [transportCostType, setTransportCostType] = useState<'shared' | 'individual'>('shared');

  // Restaurant (just name + link — most optional in Sketch)

  // Activity
  const [activityCost, setActivityCost] = useState('');
  const [activityCostType, setActivityCostType] = useState<'shared' | 'individual'>('individual');

  // Grocery
  const [groceryStore, setGroceryStore] = useState('');
  const [groceryTotal, setGroceryTotal] = useState('');
  const [groceryCostType, setGroceryCostType] = useState<'shared' | 'individual'>('shared');

  const enrichLink = async (url: string) => {
    if (!url) return;
    setEnriching(true);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.title && !name) setName(data.title);
      if (data.image) setOgImage(data.image);
    } catch {
      // best-effort
    } finally {
      setEnriching(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (type === 'lodging') {
        const { data, error } = await supabase
          .from('lodging')
          .insert({
            trip_id: tripId,
            name: stripHtml(name),
            link: link.trim() || null,
            cost_per_night: parseCost(costPerNight),
            og_image_url: ogImage,
            address: stripHtml(address) || null,
            latitude,
            longitude,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('lodging', data as Lodging);
      } else if (type === 'flight') {
        const { data, error } = await supabase
          .from('flights')
          .insert({
            trip_id: tripId,
            departure_airport: stripHtml(depAirport).toUpperCase(),
            arrival_airport: stripHtml(arrAirport).toUpperCase(),
            estimated_price: parseCost(flightPrice),
            booking_link: link.trim() || null,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('flight', data as Flight);
      } else if (type === 'transport') {
        const { data, error } = await supabase
          .from('transport')
          .insert({
            trip_id: tripId,
            subtype,
            estimated_total: parseCost(transportTotal),
            cost_type: transportCostType,
            booking_link: link.trim() || null,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('transport', data as Transport);
      } else if (type === 'restaurant') {
        const { data, error } = await supabase
          .from('restaurants')
          .insert({
            trip_id: tripId,
            name: stripHtml(name),
            link: link.trim() || null,
            og_image_url: ogImage,
            address: stripHtml(address) || null,
            latitude,
            longitude,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('restaurant', data as Restaurant);
      } else if (type === 'grocery') {
        const { data, error } = await supabase
          .from('groceries')
          .insert({
            trip_id: tripId,
            name: stripHtml(name) || 'Grocery Run',
            store_name: stripHtml(groceryStore) || null,
            store_address: stripHtml(address) || null,
            latitude,
            longitude,
            estimated_total: parseCost(groceryTotal),
            cost_type: groceryCostType,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('grocery', data as Grocery);
      } else if (type === 'activity') {
        const { data, error } = await supabase
          .from('activities')
          .insert({
            trip_id: tripId,
            name: stripHtml(name),
            estimated_cost: parseCost(activityCost),
            cost_type: activityCostType,
            link: link.trim() || null,
            og_image_url: ogImage,
            location: stripHtml(address) || null,
            latitude,
            longitude,
            notes: stripHtml(notes) || null,
          })
          .select()
          .single();
        if (error) throw error;
        onAdded('activity', data as Activity);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  const canSave = (() => {
    if (type === 'lodging' || type === 'restaurant' || type === 'activity') return name.trim().length > 0;
    if (type === 'flight') return depAirport.trim() && arrAirport.trim();
    if (type === 'transport') return !!subtype;
    if (type === 'grocery') return true;
    return false;
  })();

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.55)',
    display: 'block',
    marginBottom: 4,
  };

  const meta = COMPONENT_META[type];

  return (
    <div
      style={{
        marginTop: 14,
        padding: 16,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 14 }}>{meta.emoji}</span>
          Adding {meta.label.toLowerCase()}
        </div>
        <button
          onClick={onCancel}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, marginTop: -4 }}>
        {meta.description}
      </div>

      {/* Lodging form */}
      {type === 'lodging' && (
        <>
          <div>
            <label style={labelStyle}>Airbnb / hotel link (auto-fills title + image)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => enrichLink(link)}
              placeholder="https://airbnb.com/rooms/..."
              style={inputStyle}
            />
            {enriching && <div style={{ fontSize: 11, color: '#2d6b5a', marginTop: 4 }}>⏳ Fetching...</div>}
          </div>
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Casa Palapa — Beachfront Villa"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cost per night</label>
            <PriceInput value={costPerNight} onChange={setCostPerNight} />
          </div>
          <PlacesInput
            label="Address (optional)"
            value={address}
            onChange={setAddress}
            onPlaceSelected={(p) => {
              setAddress(p.description);
              setLatitude(p.latitude ?? null);
              setLongitude(p.longitude ?? null);
            }}
            placeholder="Tulum Beach Road, Quintana Roo"
            types={['address']}
          />
        </>
      )}

      {/* Flight form */}
      {type === 'flight' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <AirportInput
                label="From *"
                value={depAirport}
                onChange={setDepAirport}
                placeholder="JFK"
              />
            </div>
            <div style={{ flex: 1 }}>
              <AirportInput
                label="To *"
                value={arrAirport}
                onChange={setArrAirport}
                placeholder="CUN"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Estimated price per person</label>
            <PriceInput value={flightPrice} onChange={setFlightPrice} />
          </div>
          <div>
            <label style={labelStyle}>Booking link (optional)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://google.com/flights/..."
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Transport form */}
      {type === 'transport' && (
        <>
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['car_rental', 'taxi', 'public_transit'] as TransportSubtype[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubtype(s)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: subtype === s ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                    background: subtype === s ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                    color: subtype === s ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {s === 'car_rental' ? '🚗 Car rental' : s === 'taxi' ? '🚕 Taxi' : '🚆 Transit'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Estimated total cost</label>
            <PriceInput value={transportTotal} onChange={setTransportTotal} />
          </div>
          <div>
            <label style={labelStyle}>Split or individual?</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['shared', 'individual'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setTransportCostType(ct)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: transportCostType === ct ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                    background: transportCostType === ct ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                    color: transportCostType === ct ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {ct === 'shared' ? 'Split across group' : 'Individual'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Restaurant form — minimal, just name + link */}
      {type === 'restaurant' && (
        <>
          <div>
            <label style={labelStyle}>Restaurant link (auto-fills title + image)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => enrichLink(link)}
              placeholder="Google Maps, Resy, Yelp URL"
              style={inputStyle}
            />
            {enriching && <div style={{ fontSize: 11, color: '#2d6b5a', marginTop: 4 }}>⏳ Fetching...</div>}
          </div>
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hartwood"
              style={inputStyle}
            />
          </div>
          <PlacesInput
            label="Address (optional)"
            value={address}
            onChange={setAddress}
            onPlaceSelected={(p) => {
              setAddress(p.description);
              setLatitude(p.latitude ?? null);
              setLongitude(p.longitude ?? null);
            }}
            placeholder="Restaurant address"
            types={['restaurant']}
          />
        </>
      )}

      {/* Activity form */}
      {type === 'activity' && (
        <>
          <div>
            <label style={labelStyle}>Booking link (auto-fills title + image)</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={() => enrichLink(link)}
              placeholder="Viator, Airbnb Experiences URL"
              style={inputStyle}
            />
            {enriching && <div style={{ fontSize: 11, color: '#2d6b5a', marginTop: 4 }}>⏳ Fetching...</div>}
          </div>
          <div>
            <label style={labelStyle}>Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cenote day trip"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Estimated cost</label>
            <PriceInput value={activityCost} onChange={setActivityCost} />
          </div>
          <div>
            <label style={labelStyle}>Split or individual?</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['shared', 'individual'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setActivityCostType(ct)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: activityCostType === ct ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                    background: activityCostType === ct ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                    color: activityCostType === ct ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {ct === 'shared' ? 'Split across group' : 'Per person'}
                </button>
              ))}
            </div>
          </div>
          <PlacesInput
            label="Location (optional)"
            value={address}
            onChange={setAddress}
            onPlaceSelected={(p) => {
              setAddress(p.description);
              setLatitude(p.latitude ?? null);
              setLongitude(p.longitude ?? null);
            }}
            placeholder="Where is it?"
            types={['establishment']}
          />
        </>
      )}

      {/* Grocery form */}
      {type === 'grocery' && (
        <>
          <div>
            <label style={labelStyle}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Costco run"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Store</label>
            <input
              value={groceryStore}
              onChange={(e) => setGroceryStore(e.target.value)}
              placeholder="Costco / Trader Joe's"
              style={inputStyle}
            />
          </div>
          <PlacesInput
            label="Store address (optional)"
            value={address}
            onChange={setAddress}
            onPlaceSelected={(p) => {
              setAddress(p.description);
              setLatitude(p.latitude ?? null);
              setLongitude(p.longitude ?? null);
            }}
            placeholder="Where to shop"
            types={['establishment']}
          />
          <div>
            <label style={labelStyle}>Estimated total</label>
            <PriceInput value={groceryTotal} onChange={setGroceryTotal} />
          </div>
          <div>
            <label style={labelStyle}>Split or individual?</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['shared', 'individual'] as const).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setGroceryCostType(ct)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: groceryCostType === ct ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                    background: groceryCostType === ct ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                    color: groceryCostType === ct ? '#fff' : 'rgba(255,255,255,0.55)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {ct === 'shared' ? 'Split across group' : 'Individual'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notes field (all types) */}
      <div>
        <label style={labelStyle}>Notes (optional)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything your friends should know..."
          style={inputStyle}
        />
      </div>

      <button
        onClick={save}
        disabled={!canSave || saving}
        style={{
          padding: 12,
          borderRadius: 10,
          border: 'none',
          background: canSave ? 'linear-gradient(135deg, #fff, #f0ebe5)' : 'rgba(255,255,255,0.08)',
          color: canSave ? '#1a3a4a' : 'rgba(255,255,255,0.3)',
          fontSize: 14,
          fontWeight: 700,
          cursor: canSave ? 'pointer' : 'default',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {saving ? 'Adding...' : `Add ${meta.label.toLowerCase()}`}
      </button>
    </div>
  );
}

function PriceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>$</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^0-9.]/g, '');
          if (cleaned === '' || !isNaN(parseFloat(cleaned))) {
            onChange(cleaned);
          } else if (cleaned === '.') {
            onChange(cleaned);
          }
        }}
        placeholder="0"
        style={{
          width: '100%',
          padding: '10px 12px 10px 24px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: 13,
          outline: 'none',
          fontFamily: "'Outfit', sans-serif",
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
