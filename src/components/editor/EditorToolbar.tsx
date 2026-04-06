'use client';

import type { Theme, RsvpEmojis } from '@/types';
import type { TripPhase } from '@/types';

type Tab = 'theme' | 'effect' | 'settings';

const PHASE_LABELS: Record<TripPhase, string> = {
  sketch: 'Sketch',
  sell: 'Sell',
  lock: 'Lock',
  go: 'Go',
};

export function EditorToolbar({
  activeTab,
  onTabChange,
  themes,
  selectedThemeId,
  onThemeChange,
  phase,
  onPhaseChange,
  deadline,
  onDeadlineChange,
  shareSlug,
  rsvpEmojis,
  onRsvpEmojisChange,
}: {
  activeTab: Tab | null;
  onTabChange: (tab: Tab | null) => void;
  themes: Theme[];
  selectedThemeId: string | null;
  onThemeChange: (id: string | null) => void;
  phase: TripPhase;
  onPhaseChange: (phase: TripPhase) => void;
  deadline: string;
  onDeadlineChange: (date: string) => void;
  shareSlug: string;
  rsvpEmojis: RsvpEmojis;
  onRsvpEmojisChange: (e: RsvpEmojis) => void;
}) {
  const toggleTab = (tab: Tab) => {
    onTabChange(activeTab === tab ? null : tab);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/trip/${shareSlug}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <>
      {/* Expandable panel above the tab bar */}
      {activeTab && (
        <div
          style={{
            position: 'fixed',
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: 49,
            maxHeight: '50vh',
            overflowY: 'auto',
            background: 'rgba(10,20,25,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '20px 16px',
            animation: 'slideUp 0.25s cubic-bezier(.16,1,.3,1)',
          }}
        >
          <div style={{ maxWidth: 460, margin: '0 auto' }}>
            {activeTab === 'theme' && (
              <ThemePanel themes={themes} selectedId={selectedThemeId} onSelect={onThemeChange} />
            )}
            {activeTab === 'effect' && <EffectPanel />}
            {activeTab === 'settings' && (
              <SettingsPanel
                phase={phase}
                onPhaseChange={onPhaseChange}
                deadline={deadline}
                onDeadlineChange={onDeadlineChange}
                onCopyLink={copyShareLink}
                rsvpEmojis={rsvpEmojis}
                onRsvpEmojisChange={onRsvpEmojisChange}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          background: 'rgba(10,20,25,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <ToolbarTab
          icon="🎨"
          label="Theme"
          active={activeTab === 'theme'}
          onClick={() => toggleTab('theme')}
        />
        <ToolbarTab
          icon="✨"
          label="Effect"
          active={activeTab === 'effect'}
          onClick={() => toggleTab('effect')}
        />
        <ToolbarTab
          icon="⚙️"
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => toggleTab('settings')}
        />
      </div>
    </>
  );
}

function ToolbarTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: 'none',
        padding: '14px 0 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        color: active ? '#fff' : 'rgba(255,255,255,0.5)',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

// ─── Theme panel ───

function ThemePanel({
  themes,
  selectedId,
  onSelect,
}: {
  themes: Theme[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <>
      <PanelLabel text="Pick a theme" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        {themes.map((theme) => {
          const isSelected = selectedId === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              style={{
                padding: 0,
                border: isSelected ? '2px solid #fff' : '2px solid transparent',
                borderRadius: 12,
                cursor: 'pointer',
                background: 'none',
                overflow: 'hidden',
                outline: 'none',
              }}
            >
              <div
                style={{
                  height: 56,
                  background: theme.background_value,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '0 0 6px',
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                >
                  {theme.template_name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Effect panel (placeholder for animations toggle) ───

function EffectPanel() {
  return (
    <>
      <PanelLabel text="Effects" />
      <div
        style={{
          padding: '20px 16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          color: 'rgba(255,255,255,0.6)',
          fontSize: 13,
          textAlign: 'center',
        }}
      >
        ✨ Animations & confetti effects coming soon
      </div>
    </>
  );
}

// ─── Settings panel ───

const EMOJI_PRESETS: { label: string; emojis: RsvpEmojis }[] = [
  { label: 'Default', emojis: { going: '🙌', maybe: '🤔', cant: '😢' } },
  { label: 'Party',   emojis: { going: '🎉', maybe: '😬', cant: '👋' } },
  { label: 'Beach',   emojis: { going: '🌊', maybe: '🏖️', cant: '😭' } },
  { label: 'Hype',    emojis: { going: '🔥', maybe: '👀', cant: '💔' } },
  { label: 'Chill',   emojis: { going: '✨', maybe: '🌙', cant: '🥲' } },
];

function SettingsPanel({
  phase,
  onPhaseChange,
  deadline,
  onDeadlineChange,
  onCopyLink,
  rsvpEmojis,
  onRsvpEmojisChange,
}: {
  phase: TripPhase;
  onPhaseChange: (p: TripPhase) => void;
  deadline: string;
  onDeadlineChange: (d: string) => void;
  onCopyLink: () => void;
  rsvpEmojis: RsvpEmojis;
  onRsvpEmojisChange: (e: RsvpEmojis) => void;
}) {
  return (
    <>
      <PanelLabel text="Phase" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['sketch', 'sell', 'lock', 'go'] as TripPhase[]).map((p) => (
          <button
            key={p}
            onClick={() => onPhaseChange(p)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              border: phase === p ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
              background: phase === p ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              color: phase === p ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {PHASE_LABELS[p]}
          </button>
        ))}
      </div>

      <PanelLabel text="Commit deadline" />
      <input
        type="date"
        value={deadline}
        onChange={(e) => onDeadlineChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          fontSize: 13,
          outline: 'none',
          colorScheme: 'dark',
          marginBottom: 16,
        }}
      />

      <PanelLabel text="RSVP emojis" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {EMOJI_PRESETS.map((preset) => {
          const isActive =
            preset.emojis.going === rsvpEmojis.going &&
            preset.emojis.maybe === rsvpEmojis.maybe &&
            preset.emojis.cant === rsvpEmojis.cant;
          return (
            <button
              key={preset.label}
              onClick={() => onRsvpEmojisChange(preset.emojis)}
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderRadius: 12,
                border: isActive ? '1px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                background: isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                minWidth: 70,
              }}
            >
              <div style={{ fontSize: 16 }}>
                {preset.emojis.going} {preset.emojis.maybe} {preset.emojis.cant}
              </div>
              <div>{preset.label}</div>
            </button>
          );
        })}
      </div>

      <PanelLabel text="Share link" />
      <button
        onClick={onCopyLink}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.05)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        📋 Copy share link
      </button>
    </>
  );
}

function PanelLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
      }}
    >
      {text}
    </div>
  );
}
