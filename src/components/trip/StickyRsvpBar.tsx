'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Confetti } from '@/components/ui/Confetti';
import type { RsvpEmojis, RsvpStatus, TripMember, User } from '@/types';

type RsvpState = 'in' | 'maybe' | 'out' | null;

export function StickyRsvpBar({
  tripId,
  emojis,
  currentUserId,
  members,
}: {
  tripId: string;
  emojis: RsvpEmojis;
  currentUserId: string | null;
  members: (TripMember & { user: User })[];
}) {
  const router = useRouter();

  const currentMember = currentUserId
    ? members.find((m) => m.user_id === currentUserId)
    : null;
  const initialRsvp: RsvpState =
    currentMember && currentMember.rsvp !== 'pending'
      ? (currentMember.rsvp as Exclude<RsvpStatus, 'pending'>)
      : null;

  const [rsvp, setRsvp] = useState<RsvpState>(initialRsvp);
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState<'idle' | 'identity' | 'submitting'>('idle');
  const [pendingStatus, setPendingStatus] = useState<RsvpState>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [contactTouched, setContactTouched] = useState(false);

  const startRsvp = (status: RsvpState) => {
    setError('');
    if (currentUserId) {
      // Known guest — submit directly with name from existing user
      submitRsvp(status, { name: currentMember?.user.display_name || 'Guest' });
    } else {
      setPendingStatus(status);
      setStep('identity');
    }
  };

  const submitRsvp = async (
    status: RsvpState,
    identity: { name: string; email?: string; phone?: string }
  ) => {
    if (!status) return;
    setStep('submitting');
    setError('');
    try {
      const body: Record<string, string> = {
        tripId,
        status,
        name: identity.name,
      };
      if (identity.email) body.email = identity.email;
      if (identity.phone) body.phone = identity.phone;

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to RSVP');

      setRsvp(status);
      setStep('idle');
      setPendingStatus(null);
      if (status === 'in') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to RSVP');
      setStep('identity');
    }
  };

  const validContact =
    contactType === 'email'
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
      : contact.trim().length >= 5;
  const validName = name.trim().length > 0;
  const formValid = validName && validContact;

  const submitIdentity = () => {
    setNameTouched(true);
    setContactTouched(true);
    if (!formValid || !pendingStatus) return;
    const identity =
      contactType === 'email'
        ? { name: name.trim(), email: contact.trim() }
        : { name: name.trim(), phone: contact.trim() };
    submitRsvp(pendingStatus, identity);
  };

  const cancelIdentity = () => {
    setStep('idle');
    setPendingStatus(null);
    setError('');
    setNameTouched(false);
    setContactTouched(false);
  };

  const statusConfig = rsvp
    ? {
        in: { emoji: emojis.going, label: 'Going', color: '#7ecdb8' },
        maybe: { emoji: emojis.maybe, label: 'Maybe', color: '#e8c9a0' },
        out: { emoji: emojis.cant, label: "Can't make it", color: 'rgba(255,255,255,0.5)' },
      }[rsvp]
    : null;

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: 'rgba(10,20,25,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          {step === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  Quick — who are you?
                </div>
                <button
                  onClick={cancelIdentity}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                placeholder="Your name"
                style={inputStyle}
              />
              {nameTouched && !validName && (
                <div style={errorTextStyle}>Name is required</div>
              )}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setContactType(m)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 6,
                      border: 'none',
                      background: contactType === m ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: contactType === m ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {m === 'email' ? '✉️ Email' : '📱 Phone'}
                  </button>
                ))}
              </div>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onBlur={() => setContactTouched(true)}
                onKeyDown={(e) => e.key === 'Enter' && submitIdentity()}
                type={contactType === 'email' ? 'email' : 'tel'}
                placeholder={contactType === 'email' ? 'you@example.com' : '+1 555 123 4567'}
                style={inputStyle}
              />
              {contactTouched && !validContact && (
                <div style={errorTextStyle}>
                  {contactType === 'email' ? 'Enter a valid email' : 'Enter a valid phone'}
                </div>
              )}
              <button
                onClick={submitIdentity}
                disabled={!formValid}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: 'none',
                  background: formValid
                    ? 'linear-gradient(135deg, var(--rally-accent, #e8c9a0), #fff)'
                    : 'rgba(255,255,255,0.08)',
                  color: formValid ? '#1a3a4a' : 'rgba(255,255,255,0.3)',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: formValid ? 'pointer' : 'default',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {pendingStatus === 'in'
                  ? `Lock it in ${emojis.going}`
                  : pendingStatus === 'maybe'
                  ? `Maybe ${emojis.maybe}`
                  : `Confirm ${emojis.cant}`}
              </button>
              {error && (
                <div style={{ fontSize: 11, color: '#ff8a8a', textAlign: 'center' }}>{error}</div>
              )}
            </div>
          )}

          {step === 'submitting' && (
            <div style={{ textAlign: 'center', padding: 14, color: 'rgba(255,255,255,0.7)' }}>
              Submitting...
            </div>
          )}

          {step === 'idle' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {rsvp ? (
                <button
                  onClick={() => setRsvp(null)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)',
                    color: statusConfig!.color,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{statusConfig!.emoji}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{statusConfig!.label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>edit</span>
                </button>
              ) : (
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <button onClick={() => startRsvp('in')} style={primaryRsvpButton}>
                    {emojis.going} Going
                  </button>
                  <button onClick={() => startRsvp('maybe')} style={secondaryRsvpButton}>
                    {emojis.maybe}
                  </button>
                  <button onClick={() => startRsvp('out')} style={secondaryRsvpButton}>
                    {emojis.cant}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  const chat = document.getElementById('group-chat');
                  chat?.scrollIntoView({ behavior: 'smooth' });
                }}
                title="Comment"
                style={iconButtonStyle}
              >
                💬
              </button>
              <button onClick={copyLink} title="Share" style={iconButtonStyle}>
                📤
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  fontFamily: "'Outfit', sans-serif",
  boxSizing: 'border-box',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#ff8a8a',
  marginTop: -4,
};

const iconButtonStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 17,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const primaryRsvpButton: React.CSSProperties = {
  flex: 2,
  padding: '14px',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, var(--rally-accent, #e8c9a0), #fff)',
  color: '#1a3a4a',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
  boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
};

const secondaryRsvpButton: React.CSSProperties = {
  flex: 1,
  padding: '14px',
  borderRadius: 14,
  border: 'none',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 18,
  cursor: 'pointer',
  fontFamily: "'Outfit', sans-serif",
};
