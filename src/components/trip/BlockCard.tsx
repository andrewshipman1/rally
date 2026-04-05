import type { Block } from '@/types';
import { SolidCard } from '@/components/ui/SolidCard';
import { Badge } from '@/components/ui/Badge';

// Tag color palette based on common tags
const TAG_COLORS: Record<string, string> = {
  Flights: '#1a3d4a',
  'Rental Car': '#6b4c3b',
  Activities: '#2d6b5a',
  Meals: '#8b6f5c',
};

export function BlockCard({ block }: { block: Block }) {
  const tagColor = TAG_COLORS[block.tag_label || ''] || '#2d6b5a';

  return (
    <SolidCard style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5, flexWrap: 'wrap' }}>
            <Badge
              text={`${block.tag_emoji || ''} ${block.tag_label || ''}`}
              bg={tagColor}
              color="#fff"
            />
            <Badge
              text={block.cost_type === 'shared' ? 'Split' : 'Book yours'}
              bg={block.cost_type === 'shared' ? '#e0f0eb' : '#e0ebf0'}
              color={block.cost_type === 'shared' ? '#2d6b5a' : '#1a3a4a'}
            />
          </div>
          <div
            style={{
              fontFamily: 'var(--rally-font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: '#1a3a4a',
              lineHeight: 1.3,
            }}
          >
            {block.name}
          </div>
          {block.notes && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{block.notes}</div>
          )}
        </div>
        {block.cost != null && (
          <div style={{ textAlign: 'right', marginLeft: 10, flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2d6b5a', fontFamily: 'var(--rally-font-body)' }}>
              ~${block.cost}
            </div>
            <div style={{ fontSize: 9, color: '#999' }}>
              {block.cost_type === 'shared' ? 'split' : 'per person'}
            </div>
          </div>
        )}
      </div>
      {block.external_link && (
        <a
          href={block.external_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 10,
            padding: 7,
            borderRadius: 8,
            border: `1px solid ${tagColor}25`,
            color: tagColor,
            fontSize: 11,
            fontWeight: 600,
            textDecoration: 'none',
            background: `${tagColor}08`,
          }}
        >
          {block.tag_label === 'Flights' ? 'Search flights →' : 'Check rates →'}
        </a>
      )}
    </SolidCard>
  );
}
