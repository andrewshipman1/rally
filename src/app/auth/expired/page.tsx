// /auth/expired — phase 11 state 3a. Reached when the magic-link callback
// returns reason: 'expired'. Renders the "link's expired" screen with a
// fresh email field for re-sending.

import { AuthSurface } from '@/components/auth/AuthSurface';

export const metadata = { title: 'rally — link expired' };

export default async function AuthExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip } = await searchParams;
  return <AuthSurface state="expired" tripSlug={trip} />;
}
