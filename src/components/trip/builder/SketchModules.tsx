'use client';

// Sketch-phase module inputs. Renders each module section with its
// shared input component, wired to server actions that insert into
// the existing module tables. Shows existing records below each input.
// Lodging section is collapsible and add/edit flows use BottomDrawer (Session 8F).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, Flight, Transport, Activity, Grocery } from '@/types';

import { LodgingAddForm } from './LodgingAddForm';
import { LodgingCard } from './LodgingCard';
import { LineItemAddInput } from './LineItemAddInput';
import { EstimateInput } from './EstimateInput';
import { BottomDrawer } from '@/components/trip/BottomDrawer';

import {
  addFlight,
  addTransport,
  addActivity,
  setProvisionsEstimate,
} from '@/app/actions/sketch-modules';

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  dateStart: string | null;
  dateEnd: string | null;
  lodging: Lodging[];
  flights: Flight[];
  transport: Transport[];
  activities: Activity[];
  groceries: Grocery[];
  crewCount: number;
};

export function SketchModules({
  themeId,
  tripId,
  slug,
  dateStart,
  dateEnd,
  lodging,
  flights,
  transport,
  activities,
  groceries,
  crewCount,
}: Props) {
  const router = useRouter();
  const provisionsRecord = groceries.find((g) => g.name === 'Provisions');
  const [provisionsValue, setProvisionsValue] = useState<number | null>(
    provisionsRecord?.estimated_total ?? null,
  );
  const [lodgingDrawerOpen, setLodgingDrawerOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Lodging | null>(null);
  const [lodgingCollapsed, setLodgingCollapsed] = useState(false);

  function handleEditLodging(spot: Lodging) {
    setEditingSpot(spot);
    setLodgingDrawerOpen(true);
  }

  function handleOpenLodgingAdd() {
    setEditingSpot(null);
    setLodgingDrawerOpen(true);
  }

  function handleLodgingDone() {
    setLodgingDrawerOpen(false);
    setEditingSpot(null);
    setLodgingCollapsed(false); // auto-expand on add
  }

  async function handleFlightAdd(item: { name: string; cost?: number }) {
    await addFlight(tripId, slug, item.name, item.cost);
    router.refresh();
  }

  async function handleTransportAdd(item: { name: string; cost?: number }) {
    await addTransport(tripId, slug, item.name, item.cost);
    router.refresh();
  }

  async function handleActivityAdd(item: { name: string; cost?: number }) {
    await addActivity(tripId, slug, item.name, item.cost);
    router.refresh();
  }

  async function handleProvisionsChange(v: number | null) {
    setProvisionsValue(v);
    if (v !== null && v > 0) {
      await setProvisionsEstimate(tripId, slug, v);
      router.refresh();
    }
  }

  const drawerTitle = editingSpot
    ? getCopy(themeId, 'builderState.lodgingDrawerEditTitle')
    : getCopy(themeId, 'builderState.lodgingDrawerTitle');

  return (
    <div className="sketch-modules">
      {/* ─── Lodging ─────────────────────────────────────────── */}
      <div className="sketch-module lodging-module">
        <div className="lodging-header">
          <span className="field-label">
            {getCopy(themeId, 'builderState.moduleLodging')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {lodging.length > 0 && (
              <span className="lodging-count">
                {lodging.length} {getCopy(themeId, lodging.length === 1 ? 'builderState.lodging.countSuffixSingular' : 'builderState.lodging.countSuffix')}
              </span>
            )}
            <button
              type="button"
              className={`collapse-toggle${lodgingCollapsed ? ' collapse-toggle--collapsed' : ''}`}
              onClick={() => setLodgingCollapsed(!lodgingCollapsed)}
              aria-label={getCopy(themeId, 'builderState.lodgingCollapseLabel')}
            >
              &#x25BE;
            </button>
          </div>
        </div>

        <div className={`collapsible-body${lodgingCollapsed ? ' collapsible-body--collapsed' : ''}`}>
          {/* Empty state */}
          {lodging.length === 0 && (
            <div className="lodging-empty">
              <p className="lodging-empty-text">
                {getCopy(themeId, 'builderState.lodging.emptyState')}
              </p>
              <button
                className="lodging-add-btn"
                onClick={handleOpenLodgingAdd}
                type="button"
              >
                {getCopy(themeId, 'builderState.lodging.addFirst')}
              </button>
            </div>
          )}

          {/* Existing cards */}
          {lodging.length > 0 && (
            <div className="lodging-cards">
              {lodging.map((l) => (
                <LodgingCard
                  key={l.id}
                  spot={l}
                  themeId={themeId}
                  tripId={tripId}
                  slug={slug}
                  dateStart={dateStart}
                  dateEnd={dateEnd}
                  onEdit={handleEditLodging}
                  crewCount={crewCount}
                />
              ))}
            </div>
          )}

          {/* Add another button (when cards exist) */}
          {lodging.length > 0 && (
            <button
              className="lodging-add-another"
              onClick={handleOpenLodgingAdd}
              type="button"
            >
              {getCopy(themeId, 'builderState.lodging.addAnother')}
            </button>
          )}
        </div>

        {/* Lodging add/edit drawer */}
        <BottomDrawer
          open={lodgingDrawerOpen}
          onClose={() => { setLodgingDrawerOpen(false); setEditingSpot(null); }}
          title={drawerTitle}
          themeId={themeId}
        >
          <LodgingAddForm
            key={editingSpot?.id || 'new'}
            themeId={themeId}
            tripId={tripId}
            slug={slug}
            dateStart={dateStart}
            dateEnd={dateEnd}
            onDone={handleLodgingDone}
            editingSpot={editingSpot}
            crewCount={crewCount}
          />
        </BottomDrawer>
      </div>

      {/* ─── Flights ─────────────────────────────────────────── */}
      <div className="sketch-module">
        <LineItemAddInput
          themeId={themeId}
          label={getCopy(themeId, 'builderState.moduleFlights')}
          onAdd={handleFlightAdd}
          namePlaceholder={getCopy(themeId, 'builderState.moduleFlightsName')}
          costPlaceholder={getCopy(themeId, 'builderState.moduleFlightsCost')}
        />
        {flights.length > 0 && (
          <div className="sketch-module-items">
            {flights.map((f) => (
              <div key={f.id} className="sketch-module-row">
                <span className="sketch-module-row-name">{f.departure_airport}</span>
                {f.estimated_price != null && (
                  <span className="sketch-module-row-cost">~${f.estimated_price}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Transportation ──────────────────────────────────── */}
      <div className="sketch-module">
        <LineItemAddInput
          themeId={themeId}
          label={getCopy(themeId, 'builderState.moduleTransport')}
          onAdd={handleTransportAdd}
          namePlaceholder={getCopy(themeId, 'builderState.moduleTransportName')}
          costPlaceholder={getCopy(themeId, 'builderState.moduleTransportCost')}
        />
        {transport.length > 0 && (
          <div className="sketch-module-items">
            {transport.map((t) => (
              <div key={t.id} className="sketch-module-row">
                <span className="sketch-module-row-name">{t.route}</span>
                {t.estimated_total != null && (
                  <span className="sketch-module-row-cost">~${t.estimated_total}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Activities ──────────────────────────────────────── */}
      <div className="sketch-module">
        <LineItemAddInput
          themeId={themeId}
          label={getCopy(themeId, 'builderState.moduleActivities')}
          onAdd={handleActivityAdd}
          namePlaceholder={getCopy(themeId, 'builderState.moduleActivitiesName')}
          costPlaceholder={getCopy(themeId, 'builderState.moduleActivitiesCost')}
        />
        {activities.length > 0 && (
          <div className="sketch-module-items">
            {activities.map((a) => (
              <div key={a.id} className="sketch-module-row">
                <span className="sketch-module-row-name">{a.name}</span>
                {a.estimated_cost != null && (
                  <span className="sketch-module-row-cost">~${a.estimated_cost}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Provisions ──────────────────────────────────────── */}
      <div className="sketch-module">
        <EstimateInput
          themeId={themeId}
          label={getCopy(themeId, 'builderState.moduleProvisions')}
          value={provisionsValue}
          onChange={handleProvisionsChange}
        />
      </div>
    </div>
  );
}
