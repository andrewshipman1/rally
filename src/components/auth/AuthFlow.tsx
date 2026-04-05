'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ProfileSetup } from './ProfileSetup';

type Step = 'input' | 'otp' | 'profile';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AuthFlow() {
  const [step, setStep] = useState<Step>('input');
  const [method, setMethod] = useState<'phone' | 'email'>('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      if (method === 'email') {
        const { error } = await supabase.auth.signInWithOtp({ email: identifier });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone: identifier });
        if (error) throw error;
      }
      setStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const params =
        method === 'email'
          ? { email: identifier, token: otp, type: 'email' as const }
          : { phone: identifier, token: otp, type: 'sms' as const };

      const { data, error } = await supabase.auth.verifyOtp(params);
      if (error) throw error;

      // Check if user has a profile in our users table
      if (data.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (existingUser) {
          // Existing user — go to dashboard
          window.location.href = '/';
        } else {
          // New user — set up profile
          setStep('profile');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'profile') {
    return <ProfileSetup />;
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 24,
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {step === 'input' && (
        <>
          {/* Method toggle */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
            {(['email', 'phone'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMethod(m); setIdentifier(''); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: 'none',
                  background: method === m ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: method === m ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all .2s',
                }}
              >
                {m === 'email' ? '✉️ Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            {method === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <input
            type={method === 'email' ? 'email' : 'tel'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && identifier && sendOtp()}
            placeholder={method === 'email' ? 'you@example.com' : '+1 (555) 123-4567'}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 15,
              outline: 'none',
              fontFamily: "'Outfit', sans-serif",
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={sendOtp}
            disabled={!identifier || loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: identifier ? 'linear-gradient(135deg, #2d6b5a, #3a8a7a)' : 'rgba(255,255,255,0.1)',
              color: identifier ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontWeight: 700,
              cursor: identifier ? 'pointer' : 'default',
              marginTop: 12,
              fontFamily: "'Outfit', sans-serif",
              transition: 'all .2s',
            }}
          >
            {loading ? 'Sending...' : 'Send verification code'}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📬</div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Check your {method}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              We sent a code to {identifier}
            </div>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && verifyOtp()}
            placeholder="000000"
            maxLength={6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: 8,
              outline: 'none',
              fontFamily: "'Outfit', sans-serif",
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={verifyOtp}
            disabled={otp.length !== 6 || loading}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: otp.length === 6 ? 'linear-gradient(135deg, #2d6b5a, #3a8a7a)' : 'rgba(255,255,255,0.1)',
              color: otp.length === 6 ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: 15,
              fontWeight: 700,
              cursor: otp.length === 6 ? 'pointer' : 'default',
              marginTop: 12,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={() => { setStep('input'); setOtp(''); }}
            style={{
              width: '100%',
              padding: 10,
              border: 'none',
              background: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              cursor: 'pointer',
              marginTop: 8,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            ← Use a different {method}
          </button>
        </>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,100,100,0.15)', color: '#ff8a8a', fontSize: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}
