import { GlassCard } from '@/components/ui/GlassCard';

export function Description({ text }: { text: string }) {
  return (
    <GlassCard style={{ border: 'none', position: 'relative', paddingTop: 22 }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -8,
          left: 10,
          fontSize: 72,
          lineHeight: 1,
          fontFamily: 'var(--rally-font-display)',
          color: 'var(--rally-accent, #e8c9a0)',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      >
        “
      </div>
      <div
        style={{
          fontSize: 17,
          color: 'rgba(255,255,255,0.94)',
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--rally-font-display)',
          fontStyle: 'italic',
          fontWeight: 400,
          position: 'relative',
        }}
      >
        {text}
      </div>
    </GlassCard>
  );
}
