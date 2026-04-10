export function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: 'var(--ink)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.8,
        fontFamily: 'var(--font-body, DM Sans, sans-serif)',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
