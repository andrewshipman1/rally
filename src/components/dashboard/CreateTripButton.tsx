'use client';

import { useTransition } from 'react';
import { createTrip } from '@/app/actions/create-trip';
import { getCopy } from '@/lib/copy/get-copy';

export function CreateTripButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="dash-cta"
      disabled={pending}
      onClick={() => startTransition(() => createTrip())}
      style={{ opacity: pending ? 0.6 : 1 }}
    >
      {getCopy('just-because', 'dashboard.ctaCreate')}
    </button>
  );
}
