'use client';

// 10D — auth-state-aware portion of the invitee teaser. Owns the
// unlocked + linkSent state that drives LockedPlan's reveal animation
// and the InviteeStickyBar's post-tap pill. Keeps InviteeShell server-
// rendered for SEO + initial-paint preservation per the 10D brief
// option (b).
//
// Two reveal entry points:
//   1. Cross-tab — Supabase storage events fire onAuthStateChange in
//      this tab when the magic-link click happens elsewhere. SIGNED_IN
//      → unlocked=true → router.replace after the animation.
//   2. Same-tab (10D-followup) — the resolver passes `freshAuth=true`
//      when the URL is /i/<token>?just_authed=1 with an authed
//      session (post-callback trampoline). Mount-time effect plays
//      the same reveal + router.replace sequence without waiting on
//      the auth listener.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockedPlan } from '@/components/trip/LockedPlan';
import { PoeticFooter } from '@/components/trip/PoeticFooter';
import { InviteeStickyBar } from '@/components/trip/InviteeStickyBar';
import { createClient } from '@/lib/supabase/client';
import type { ThemeId } from '@/lib/themes/types';
import type { Lodging, Flight, Activity, TripCostSummary } from '@/types';

// Aligns with the LockedPlan reveal CSS (600ms blur + 200ms overlay
// fade starting ~300ms in). 700ms gives the reveal a beat to settle
// before router.replace silently catches the URL up.
const REVEAL_MS = 700;

type Props = {
  themeId: ThemeId;
  slug: string;
  inviteeEmail: string;
  inviteToken: string;
  lodging: Lodging[];
  flights: Flight[];
  activities: Activity[];
  cost: TripCostSummary;
  /** Set by the resolver on `?just_authed=1` post-callback hits. */
  freshAuth?: boolean;
};

export function InviteeShellClient({
  themeId,
  slug,
  inviteeEmail,
  inviteToken,
  lodging,
  flights,
  activities,
  cost,
  freshAuth = false,
}: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const unlockedRef = useRef(false);

  // Same-tab reveal — drive the animation immediately on mount when the
  // resolver tagged this render as freshAuth. A tiny tick delay lets
  // the initial paint commit with `unlocked=false` so the CSS blur +
  // overlay transitions actually run instead of snapping to the end
  // state. Mark unlockedRef so the auth listener below doesn't fire a
  // duplicate reveal if SIGNED_IN propagates concurrently.
  useEffect(() => {
    if (!freshAuth || unlockedRef.current) return;
    unlockedRef.current = true;
    const tickId = setTimeout(() => setUnlocked(true), 50);
    const replaceId = setTimeout(() => {
      router.replace(`/trip/${slug}`);
    }, REVEAL_MS + 50);
    return () => {
      clearTimeout(tickId);
      clearTimeout(replaceId);
    };
  }, [freshAuth, router, slug]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_IN' || unlockedRef.current) return;
      unlockedRef.current = true;
      setUnlocked(true);
      // Let the reveal play, then silently catch the URL up to the
      // canonical trip route.
      setTimeout(() => {
        router.replace(`/trip/${slug}`);
      }, REVEAL_MS);
    });
    return () => subscription.unsubscribe();
  }, [router, slug]);

  return (
    <>
      <LockedPlan
        themeId={themeId}
        lodging={lodging}
        flights={flights}
        activities={activities}
        cost={cost}
        unlocked={unlocked}
        linkSent={linkSent}
      />

      <PoeticFooter themeId={themeId} />

      <InviteeStickyBar
        themeId={themeId}
        slug={slug}
        inviteeEmail={inviteeEmail}
        inviteToken={inviteToken}
        onLinkSent={() => setLinkSent(true)}
      />
    </>
  );
}
