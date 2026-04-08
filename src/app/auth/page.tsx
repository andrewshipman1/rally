// /auth — phase 11 landing state. The first screen a logged-out user sees.
// Optional ?trip=<slug> param preserves the invite target through the
// magic-link flow per phase 11 invitee notes.

import { AuthSurface } from '@/components/auth/AuthSurface';

export const metadata = {
  title: 'rally — let me in',
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  const { trip } = await searchParams;
  return <AuthSurface state="landing" tripSlug={trip} />;
}
