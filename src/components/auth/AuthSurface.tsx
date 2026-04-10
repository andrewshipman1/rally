'use client';

// Phase 11 four-state auth surface. Renders one of:
//   landing  → email field + send button
//   sent     → confirmation + resend (with 30s cooldown)
//   expired  → 'oops ⏱' sticker + send-new CTA
//   invalid  → 'huh 🤔' sticker + send-new CTA
//
// Source mockup: rally-phase-11-auth.html. Copy: lexicon §5.24, resolved
// via getCopy('auth.*'). The surface intentionally renders in light mode
// only per phase 11 — chassis dual-mode applies elsewhere, but the door is
// always cream/ink so it reads consistently regardless of the user's
// theme picker state (they may not even have a trip yet).

import { useEffect, useState } from 'react';
import { getCopy } from '@/lib/copy/get-copy';

import './auth-surface.css';

type State = 'landing' | 'sent' | 'expired' | 'invalid';
type Props = { state: State; tripSlug?: string };

const COOLDOWN_S = 30;
// Auth surface uses just-because as its theme so getCopy() resolves cleanly.
// All §5.24 strings live in the lexicon default and get rendered against
// just-because as a no-op theme.
const T = 'just-because' as const;

export function AuthSurface({ state: initialState, tripSlug }: Props) {
  const [state, setState] = useState<State>(initialState);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown — pure setInterval, hydration-safe (initial state
  // is 0, only set inside useEffect).
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const send = async (forEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: forEmail, trip: tripSlug }),
      });
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        if (body?.error === 'cooldown') {
          setCooldown(Math.ceil((body.retryInMs ?? COOLDOWN_S * 1000) / 1000));
          setState('sent');
          return;
        }
        setError(getCopy(T, 'auth.errors.rateLimited'));
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body?.error === 'invalid_email'
            ? getCopy(T, 'auth.errors.invalidEmail')
            : getCopy(T, 'auth.errors.sendFailed')
        );
        return;
      }
      setState('sent');
      setCooldown(COOLDOWN_S);
    } catch {
      setError(getCopy(T, 'auth.errors.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !email) return;
    void send(email);
  };

  return (
    <div className="auth-chassis">
      {state === 'landing' && (
        <>
          <h1 className="auth-wordmark">
            rally<span className="auth-bang">!</span>
          </h1>
          <p className="auth-subhead">{getCopy(T, 'auth.landing.sub')}</p>
          <form className="auth-form" onSubmit={onSubmit}>
            <input
              type="email"
              className="auth-input"
              placeholder={getCopy(T, 'auth.landing.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              className={`auth-btn-primary${loading ? ' loading' : ''}`}
              disabled={loading || !email}
            >
              {loading ? getCopy(T, 'auth.landing.loading') : getCopy(T, 'auth.landing.sendButton')}
            </button>
          </form>
        </>
      )}

      {state === 'sent' && (
        <>
          <div className="auth-sent-icon">{getCopy(T, 'auth.sent.icon')}</div>
          <h1 className="auth-sent-h1">{getCopy(T, 'auth.sent.h1')}</h1>
          <p className="auth-sent-sub">{getCopy(T, 'auth.sent.sub', { email })}</p>
          <div className="auth-resend-row">
            {cooldown > 0 ? (
              <span>{getCopy(T, 'auth.sent.cooldown', { n: cooldown })}</span>
            ) : (
              <>
                <span>{getCopy(T, 'auth.sent.resend')} </span>
                <button
                  type="button"
                  className="auth-link"
                  disabled={loading}
                  onClick={() => void send(email)}
                >
                  {getCopy(T, 'auth.sent.resend')}
                </button>
              </>
            )}
          </div>
          {error && <div className="auth-error">{error}</div>}
        </>
      )}

      {(state === 'expired' || state === 'invalid') && (
        <>
          <span className={`auth-err-sticker${state === 'expired' ? ' expired' : ''}`}>
            {getCopy(T, state === 'expired' ? 'auth.expired.sticker' : 'auth.invalid.sticker')}
          </span>
          <h1 className="auth-err-h1">
            {getCopy(T, state === 'expired' ? 'auth.expired.h1' : 'auth.invalid.h1')}
          </h1>
          <p className="auth-err-sub">
            {getCopy(T, state === 'expired' ? 'auth.expired.sub' : 'auth.invalid.sub')}
          </p>
          <form className="auth-form" onSubmit={onSubmit}>
            <input
              type="email"
              className="auth-input"
              placeholder={getCopy(T, 'auth.landing.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <div className="auth-error">{error}</div>}
            <button
              type="submit"
              className={`auth-btn-primary${loading ? ' loading' : ''}`}
              disabled={loading || !email}
            >
              {loading
                ? getCopy(T, 'auth.landing.loading')
                : getCopy(T, state === 'expired' ? 'auth.expired.cta' : 'auth.invalid.cta')}
            </button>
          </form>
        </>
      )}

      <div className="auth-footer">{'made with rally'}<span className="auth-bang">{'!'}</span></div>
    </div>
  );
}
