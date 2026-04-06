export function displayName(name: string | null | undefined, max: number = 20): string {
  const n = (name || '').trim();
  if (!n) return 'Guest';
  if (n.length <= max) return n;
  return n.slice(0, Math.max(1, max - 1)) + '…';
}
