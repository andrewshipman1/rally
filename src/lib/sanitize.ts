export function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').trim();
}
