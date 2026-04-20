'use client';

// Session 9A-fix — client wrapper for <Headliner> on the sell / lock / go
// render path. page.tsx is a server component, so passing an onOpen handler
// directly tripped Next.js's "Event handlers cannot be passed to Client
// Component props" check. This wrapper holds any client-side state on the
// client. Do NOT inline handlers back into page.tsx.
//
// 9H — readOnly={true}: sell is fully read-only for all viewers under
// option C (organizer edits via future sketch-mode portal, not on sell).
// Pure prop-adapter — no handlers, no state. `onOpen` is omitted;
// Headliner's readOnly branch drops all click handlers, so the prop
// would be ignored anyway.

import { Headliner, type HeadlinerData } from '@/components/trip/builder/Headliner';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  headliner: HeadlinerData;
};

export function SellHeadliner({ themeId, headliner }: Props) {
  return <Headliner themeId={themeId} headliner={headliner} readOnly />;
}
