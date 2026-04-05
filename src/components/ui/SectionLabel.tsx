export function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: 'var(--rally-accent)',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.8,
        fontFamily: 'var(--rally-font-body)',
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
