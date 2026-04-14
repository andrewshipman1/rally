// Session 8J: shared helper around the /api/enrich endpoint.
// Both the lodging form (8A/8B) and the headliner drawer (8J) pull OG
// metadata the same way — this keeps the fetch + URL check in one place
// without extracting a full hook. Loading state stays per-component.

export type OgData = {
  title: string | null;
  description: string | null;
  image: string | null;
};

/**
 * Fetch OG metadata for a URL via the /api/enrich endpoint.
 * Returns null if the input doesn't look like an http(s) URL or the
 * fetch fails — callers fall back to manual entry in either case.
 */
export async function enrichUrl(url: string): Promise<OgData | null> {
  if (!/^https?:\/\/.+/.test(url)) return null;
  try {
    const res = await fetch('/api/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    return (await res.json()) as OgData;
  } catch {
    return null;
  }
}
