/**
 * Maps deeplink — opens in Google Maps (or Apple Maps via universal link).
 * Use lat/lng if available, otherwise fall back to the address text.
 */
export function MapsLink({
  address,
  latitude,
  longitude,
  size = 14,
}: {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  size?: number;
}) {
  if (!address && !latitude) return null;

  const query =
    latitude && longitude
      ? `${latitude},${longitude}`
      : encodeURIComponent(address || '');
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Open in Maps"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 8,
        height: size + 8,
        marginLeft: 4,
        borderRadius: 6,
        background: 'rgba(0,0,0,0.06)',
        color: '#2d6b5a',
        fontSize: size,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      📍
    </a>
  );
}
