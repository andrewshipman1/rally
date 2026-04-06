import { GlassCard } from '@/components/ui/GlassCard';

export function Description({ text }: { text: string }) {
  return (
    <GlassCard>
      <div
        style={{
          fontSize: 14,
          color: '#fff',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--rally-font-body)',
        }}
      >
        {text}
      </div>
    </GlassCard>
  );
}
