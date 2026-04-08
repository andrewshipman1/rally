'use client';

// Debounce-and-merge hook for the sketch builder auto-save path.
//
// Every keystroke calls queue() with a partial patch; the hook merges
// pending patches in-place and restarts a debounce timer. When the
// timer fires, the accumulated patch is sent to the server action as
// a single call. flush() short-circuits the timer for the manual ✏️
// button and for unmount cleanup.
//
// The hook intentionally does NOT use router.refresh() — controlled
// inputs in the parent are the source of truth while the builder is
// mounted. The server action's revalidatePath takes effect on the
// next full navigation, which is exactly when we want the cached
// copy to update.

import { useCallback, useEffect, useRef, useState } from 'react';
import { updateTripSketch, type SketchPatch } from '@/app/actions/update-trip-sketch';

export type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export function useDebouncedAutosave(
  tripId: string,
  slug: string,
  delayMs = 400,
): {
  status: AutosaveStatus;
  queue: (patch: SketchPatch) => void;
  flush: () => Promise<void>;
} {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const pendingRef = useRef<SketchPatch>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflightRef = useRef<Promise<void> | null>(null);

  const flush = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (Object.keys(pendingRef.current).length === 0) return;
    const patch = pendingRef.current;
    pendingRef.current = {};
    setStatus('saving');
    const run = (async () => {
      try {
        const result = await updateTripSketch(tripId, slug, patch);
        setStatus(result.ok ? 'saved' : 'error');
      } catch {
        setStatus('error');
      }
    })();
    inflightRef.current = run;
    await run;
    if (inflightRef.current === run) inflightRef.current = null;
  }, [tripId, slug]);

  const queue = useCallback(
    (patch: SketchPatch) => {
      pendingRef.current = { ...pendingRef.current, ...patch };
      setStatus('dirty');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    [delayMs, flush],
  );

  // On unmount: if there's still pending work, fire one last save.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (Object.keys(pendingRef.current).length > 0) {
        // Fire-and-forget; we're unmounting so we can't await.
        void updateTripSketch(tripId, slug, pendingRef.current);
      }
    };
  }, [tripId, slug]);

  return { status, queue, flush };
}
