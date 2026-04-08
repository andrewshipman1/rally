// /auth/invalid — phase 11 state 3b. Reached when the magic-link callback
// returns reason: 'invalid' (used or broken link).

import { AuthSurface } from '@/components/auth/AuthSurface';

export const metadata = { title: 'rally — link broken' };

export default async function AuthInvalidPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip } = await searchParams;
  return <AuthSurface state="invalid" tripSlug={trip} />;
}
