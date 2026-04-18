'use client';

// Session 9A-fix — client wrapper for <Headliner> on the sell / lock / go
// render path. page.tsx is a server component, so passing `onOpen={() => {}}`
// directly tripped Next.js's "Event handlers cannot be passed to Client
// Component props" check. This wrapper holds the noop on the client side.
// Do NOT inline the handler back into page.tsx.

import { Headliner, type HeadlinerData } from '@/components/trip/builder/Headliner';
import type { ThemeId } from '@/lib/themes/types';

type Props = {
  themeId: ThemeId;
  headliner: HeadlinerData;
};

export function SellHeadliner({ themeId, headliner }: Props) {
  return (
    <Headliner
      themeId={themeId}
      headliner={headliner}
      onOpen={() => {}}
    />
  );
}
