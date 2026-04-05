export function Avatar({
  initials,
  color,
  size = 32,
  border = '2px solid rgba(255,255,255,0.2)',
  photoUrl,
  onClick,
  style,
}: {
  initials: string;
  color: string;
  size?: number;
  border?: string;
  photoUrl?: string | null;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: photoUrl ? `url(${photoUrl}) center/cover` : color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: size * 0.38,
        fontFamily: 'var(--rally-font-body)',
        border,
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        ...style,
      }}
    >
      {!photoUrl && initials}
    </div>
  );
}
