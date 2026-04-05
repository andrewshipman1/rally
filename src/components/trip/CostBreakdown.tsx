import type { Block } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';

// Map tag labels to icons
const TAG_ICONS: Record<string, string> = {
  'The House': '🏠',
  Flights: '✈️',
  'Rental Car': '🚗',
  Activities: '🤿',
  Meals: '🍽️',
};

export function CostBreakdown({
  blocks,
  confirmedCount,
  dateStr,
}: {
  blocks: Block[];
  confirmedCount: number;
  dateStr: string;
}) {
  const count = confirmedCount || 1;

  // Calculate per-person costs
  const breakdown: { label: string; val: number; icon: string }[] = [];
  let sharedTotal = 0;
  let individualTotal = 0;

  for (const block of blocks) {
    if (block.cost == null) continue;
    const icon = TAG_ICONS[block.tag_label || ''] || block.tag_emoji || '📦';
    const label = block.tag_label || block.name;

    if (block.cost_type === 'shared') {
      const pp = Math.round(block.cost / count);
      sharedTotal += pp;
      breakdown.push({ label, val: pp, icon });
    } else {
      individualTotal += block.cost;
      breakdown.push({ label, val: block.cost, icon });
    }
  }

  const totalPP = sharedTotal + individualTotal;

  // Count nights from dateStr (rough)
  const nightsMatch = dateStr.match(/(\d+)–(\d+)/);
  const nights = nightsMatch ? parseInt(nightsMatch[2]) - parseInt(nightsMatch[1]) : 3;

  return (
    <GlassCard className="text-center" >
      <div style={{ padding: '4px 0' }}>
        <div
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          Estimated per person
        </div>
        <div
          style={{
            fontFamily: 'var(--rally-font-display)',
            fontSize: 52,
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          ~${totalPP}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3, marginBottom: 16 }}>
          {nights} nights • {count} people
        </div>

        {/* Line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left' }}>
          {breakdown.map((b) => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13 }}>{b.icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 70,
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,.1)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${totalPP > 0 ? (b.val / totalPP) * 100 : 0}%`,
                      background: 'var(--rally-accent)',
                      borderRadius: 2,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: '#fff',
                    fontWeight: 600,
                    minWidth: 36,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ${b.val}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Shared vs Individual badges */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Badge text={`🏠 Shared: ~$${sharedTotal}/pp`} bg="rgba(45,107,90,.2)" color="#7ecdb8" />
          <Badge
            text={`✈️ Book yours: ~$${individualTotal}`}
            bg="rgba(26,58,74,.2)"
            color="rgba(255,255,255,.7)"
          />
        </div>
      </div>
    </GlassCard>
  );
}
