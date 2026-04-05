export function Badge({
  text,
  bg,
  color,
}: {
  text: string;
  bg: string;
  color: string;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 10,
        background: bg,
        color,
        fontFamily: 'var(--rally-font-body)',
        letterSpacing: 0.3,
      }}
    >
      {text}
    </span>
  );
}
