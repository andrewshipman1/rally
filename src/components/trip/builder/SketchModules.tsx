'use client';

// Sketch-phase module inputs. Renders each module section with its
// shared input component, wired to server actions that insert into
// the existing module tables. Shows existing records below each input.
// Lodging section is collapsible and add/edit flows use BottomDrawer (Session 8F).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCopy } from '@/lib/copy/get-copy';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, Transport, Grocery } from '@/types';

import { LodgingAddForm } from './LodgingAddForm';
import { LodgingCard } from './LodgingCard';
import { EstimateInput } from './EstimateInput';
import { BottomDrawer } from '@/components/trip/BottomDrawer';
import { Headliner, type HeadlinerData } from './Headliner';
import { HeadlinerDrawerForm } from './HeadlinerDrawerForm';
import { TransportAddForm } from './TransportAddForm';
import { TransportCard as SketchTransportCard } from './TransportCard';

import { setProvisionsEstimate, setOtherEstimate } from '@/app/actions/sketch-modules';
import { setActivitiesEstimate } from '@/app/actions/update-trip-sketch';

type Props = {
  themeId: ThemeId;
  tripId: string;
  slug: string;
  dateStart: string | null;
  dateEnd: string | null;
  lodging: Lodging[];
  transport: Transport[];
  groceries: Grocery[];
  crewCount: number;
  /** Session 8J — optional, singular trip-level "headliner" data. */
  headliner: HeadlinerData;
  /** Session 8K — sketch activities estimate (whole dollars, per person). */
  activitiesEstimate: number | null;
};

export function SketchModules({
  themeId,
  tripId,
  slug,
  dateStart,
  dateEnd,
  lodging,
  transport,
  groceries,
  crewCount,
  headliner,
  activitiesEstimate,
}: Props) {
  const router = useRouter();
  const provisionsRecord = groceries.find((g) => g.name === 'Provisions');
  const [provisionsValue, setProvisionsValue] = useState<number | null>(
    provisionsRecord?.estimated_total ?? null,
  );
  // Session 8K — single per-person estimate, same shape as provisions.
  const [activitiesValue, setActivitiesValue] = useState<number | null>(
    activitiesEstimate ?? null,
  );
  // Session 8P — "other" per-person estimate, groceries.name='Other'.
  const otherRecord = groceries.find((g) => g.name === 'Other');
  const [otherValue, setOtherValue] = useState<number | null>(
    otherRecord?.estimated_total ?? null,
  );
  const [lodgingDrawerOpen, setLodgingDrawerOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<Lodging | null>(null);
  const [lodgingCollapsed, setLodgingCollapsed] = useState(false);
  const [headlinerDrawerOpen, setHeadlinerDrawerOpen] = useState(false);
  // Session 8M — transportation drawer state.
  const [transportDrawerOpen, setTransportDrawerOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
  const [transportCollapsed, setTransportCollapsed] = useState(false);

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

  function handleOpenTransportAdd() {
    setEditingTransport(null);
    setTransportDrawerOpen(true);
  }

  function handleEditTransport(t: Transport) {
    setEditingTransport(t);
    setTransportDrawerOpen(true);
  }

  function handleTransportDone() {
    setTransportDrawerOpen(false);
    setEditingTransport(null);
    setTransportCollapsed(false);
  }

  async function handleActivitiesChange(v: number | null) {
    setActivitiesValue(v);
    // Mirror provisions' save-on-change: persist positive values; clearing
    // the field below 1 leaves the previous non-null persisted value in
    // place — the user can clear explicitly by entering 0 if needed.
    if (v !== null && v > 0) {
      await setActivitiesEstimate(tripId, slug, v);
      router.refresh();
    }
  }

  async function handleProvisionsChange(v: number | null) {
    setProvisionsValue(v);
    if (v !== null && v > 0) {
      await setProvisionsEstimate(tripId, slug, v);
      router.refresh();
    }
  }

  async function handleOtherChange(v: number | null) {
    setOtherValue(v);
    if (v !== null && v > 0) {
      await setOtherEstimate(tripId, slug, v);
      router.refresh();
    }
  }

  const drawerTitle = editingSpot
    ? getCopy(themeId, 'builderState.lodgingDrawerEditTitle')
    : getCopy(themeId, 'builderState.lodgingDrawerTitle');

  const headlinerIsSet = !!headliner.description;
  const headlinerDrawerTitle = headlinerIsSet
    ? getCopy(themeId, 'builderState.headliner.drawerTitleEdit')
    : getCopy(themeId, 'builderState.headliner.drawerTitleAdd');

  return (
    <div className="sketch-modules">
      {/* ─── Headliner (8J — refactored onto primitives 8N) ──── */}
      <div className="module-section headliner-module">
        <div className="module-section-header">
          <span className="module-section-title">
            {getCopy(themeId, 'builderState.headliner.eyebrow')}
          </span>
          {headlinerIsSet && (
            <span className="module-section-count">
              {getCopy(themeId, 'builderState.headliner.estimateCaption')}
            </span>
          )}
        </div>
        <Headliner
          themeId={themeId}
          headliner={headliner}
          onOpen={() => setHeadlinerDrawerOpen(true)}
        />
      </div>

      <BottomDrawer
        open={headlinerDrawerOpen}
        onClose={() => setHeadlinerDrawerOpen(false)}
        title={headlinerDrawerTitle}
        themeId={themeId}
      >
        <HeadlinerDrawerForm
          key={headliner.description ?? 'new'}
          themeId={themeId}
          tripId={tripId}
          slug={slug}
          initial={headliner}
          onDone={() => setHeadlinerDrawerOpen(false)}
        />
      </BottomDrawer>

      {/* ─── Lodging ─────────────────────────────────────────── */}
      <div className="module-section lodging-module">
        <div className="module-section-header lodging-header">
          <span className="module-section-title">
            {getCopy(themeId, 'builderState.moduleLodging')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {lodging.length > 0 && (
              <span className="module-section-count lodging-count">
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
            <div className="module-section-empty lodging-empty">
              <p className="module-section-empty-text">
                {getCopy(themeId, 'builderState.lodging.emptyState')}
              </p>
              <button
                className="module-section-add lodging-add-btn"
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
              className="module-section-add-outline lodging-add-another"
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

      {/* Session 8N — "getting there" (flights) removed from sketch.
          The per-crew arrival estimator lives at sell+ (see plan). The
          flights table, addFlight action, and legacy rendering on the
          non-sketch trip page are preserved. */}

      {/* ─── Transportation (Session 8M, refactored 8N) ──────── */}
      <div className="module-section transport-module">
        <div className="module-section-header transport-module-header">
          <span className="module-section-title">
            {getCopy(themeId, 'builderState.transport.moduleTitle')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {transport.length > 0 && (
              <span className="module-section-count">
                {transport.length} {getCopy(themeId, transport.length === 1 ? 'builderState.transport.countSuffixSingular' : 'builderState.transport.countSuffix')}
              </span>
            )}
            <button
              type="button"
              className={`collapse-toggle${transportCollapsed ? ' collapse-toggle--collapsed' : ''}`}
              onClick={() => setTransportCollapsed(!transportCollapsed)}
              aria-label={getCopy(themeId, 'builderState.transport.collapseLabel')}
            >
              &#x25BE;
            </button>
          </div>
        </div>

        <div className={`collapsible-body${transportCollapsed ? ' collapsible-body--collapsed' : ''}`}>
          {transport.length === 0 && (
            <div className="module-section-empty transport-module-empty">
              <p className="module-section-empty-text">
                {getCopy(themeId, 'builderState.transport.emptyHint')}
              </p>
              <button
                type="button"
                className="module-section-add"
                onClick={handleOpenTransportAdd}
              >
                {getCopy(themeId, 'builderState.transport.addButton')}
              </button>
            </div>
          )}

          {transport.length > 0 && (
            <>
              <div className="transport-module-cards">
                {transport.map((t) => (
                  <SketchTransportCard
                    key={t.id}
                    transport={t}
                    themeId={themeId}
                    onEdit={handleEditTransport}
                  />
                ))}
              </div>
              <button
                type="button"
                className="module-section-add-outline"
                onClick={handleOpenTransportAdd}
              >
                {getCopy(themeId, 'builderState.transport.addButton')}
              </button>
            </>
          )}
        </div>

        <BottomDrawer
          open={transportDrawerOpen}
          onClose={() => { setTransportDrawerOpen(false); setEditingTransport(null); }}
          title={
            editingTransport
              ? getCopy(themeId, 'builderState.transport.drawerTitleEdit')
              : getCopy(themeId, 'builderState.transport.drawerTitleAdd')
          }
          themeId={themeId}
        >
          <TransportAddForm
            key={editingTransport?.id ?? 'new'}
            themeId={themeId}
            tripId={tripId}
            slug={slug}
            editing={editingTransport}
            onDone={handleTransportDone}
          />
        </BottomDrawer>
      </div>

      {/* ─── Everything else (Session 8P — merged activities + provisions + other) ─── */}
      <div className="module-section everything-else-module">
        <div className="module-section-header">
          <span className="module-section-title">
            {getCopy(themeId, 'builderState.everythingElse.title')}
          </span>
          <span className="module-section-count">
            {getCopy(themeId, 'builderState.everythingElse.eyebrow')}
          </span>
        </div>
        <div className="everything-else-rows">
          <EstimateInput
            themeId={themeId}
            label={getCopy(themeId, 'builderState.everythingElse.activitiesLabel')}
            value={activitiesValue}
            onChange={handleActivitiesChange}
            placeholder={getCopy(themeId, 'builderState.everythingElse.placeholder')}
          />
          <EstimateInput
            themeId={themeId}
            label={getCopy(themeId, 'builderState.everythingElse.provisionsLabel')}
            value={provisionsValue}
            onChange={handleProvisionsChange}
            placeholder={getCopy(themeId, 'builderState.everythingElse.placeholder')}
            hint={getCopy(themeId, 'builderState.everythingElse.provisionsHint')}
          />
          <EstimateInput
            themeId={themeId}
            label={getCopy(themeId, 'builderState.everythingElse.otherLabel')}
            value={otherValue}
            onChange={handleOtherChange}
            placeholder={getCopy(themeId, 'builderState.everythingElse.placeholder')}
            hint={getCopy(themeId, 'builderState.everythingElse.otherHint')}
          />
        </div>
      </div>
    </div>
  );
}
