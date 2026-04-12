'use client';

import { useState, useRef, useTransition, useCallback, useEffect } from 'react';
import { getCopy } from '@/lib/copy/get-copy';
import { updateProfile } from '@/app/actions/update-profile';
import { uploadProfilePhoto } from '@/lib/supabase/upload';
import type { PassportProfile } from '@/lib/passport';
import type { ThemeId } from '@/lib/themes/types';

// ─── Types ────────────────────────────────────────────────────────────────

type FieldStatus = 'idle' | 'editing' | 'saving' | 'saved' | 'error';

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder: string;
  dbField: string;
  type?: string;
  stripAt?: boolean;
  theme: ThemeId;
}

// ─── Inline editable field ────────────────────────────────────────────────

function InlineField({
  label,
  value,
  placeholder,
  dbField,
  type = 'text',
  stripAt = false,
  theme,
}: EditableFieldProps) {
  const [status, setStatus] = useState<FieldStatus>('idle');
  const [currentValue, setCurrentValue] = useState(value);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(async () => {
    const trimmed = editValue.trim();
    const cleaned = stripAt ? trimmed.replace(/^@/, '') : trimmed;

    // No change — just close
    if (cleaned === currentValue) {
      setStatus('idle');
      return;
    }

    setStatus('saving');
    startTransition(async () => {
      const result = await updateProfile({ [dbField]: cleaned });
      if (result.ok) {
        setCurrentValue(cleaned);
        setEditValue(cleaned);
        setStatus('saved');
        timerRef.current = setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    });
  }, [editValue, currentValue, dbField, stripAt, startTransition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setEditValue(currentValue);
      setStatus('idle');
    }
  };

  const startEditing = () => {
    setEditValue(currentValue);
    setStatus('editing');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (status === 'editing' || status === 'saving' || status === 'saved' || status === 'error') {
    return (
      <div className="passport-detail-row">
        <div className="passport-edit-field">
          <span className="passport-edit-label">{label}</span>
          <input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={save}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="passport-edit-input"
            disabled={status === 'saving'}
            autoFocus
          />
          {status === 'saved' && (
            <span className="passport-save-indicator passport-save-ok">
              {getCopy(theme, 'profile.saveSuccess')}
            </span>
          )}
          {status === 'error' && (
            <span
              className="passport-save-indicator passport-save-err"
              onClick={save}
            >
              {getCopy(theme, 'profile.saveFailed')}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Idle / read state
  return (
    <div className="passport-detail-row" onClick={startEditing}>
      <span className="passport-detail-label">{label}</span>
      <span className={`passport-detail-value${!currentValue ? ' placeholder' : ''}`}>
        {currentValue || placeholder}
      </span>
      <span className="passport-pencil">✎</span>
    </div>
  );
}

// ─── Profile head fields (name + bio) ─────────────────────────────────────

function InlineHeadField({
  value,
  placeholder,
  dbField,
  className,
  theme,
}: {
  value: string;
  placeholder: string;
  dbField: string;
  className: string;
  theme: ThemeId;
}) {
  const [status, setStatus] = useState<FieldStatus>('idle');
  const [currentValue, setCurrentValue] = useState(value);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(async () => {
    const trimmed = editValue.trim();
    if (trimmed === currentValue) {
      setStatus('idle');
      return;
    }

    // Don't allow empty display name
    if (dbField === 'display_name' && !trimmed) {
      setEditValue(currentValue);
      setStatus('idle');
      return;
    }

    setStatus('saving');
    startTransition(async () => {
      const result = await updateProfile({ [dbField]: trimmed });
      if (result.ok) {
        setCurrentValue(trimmed);
        setEditValue(trimmed);
        setStatus('saved');
        timerRef.current = setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    });
  }, [editValue, currentValue, dbField, startTransition]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
    if (e.key === 'Escape') {
      setEditValue(currentValue);
      setStatus('idle');
    }
  };

  const startEditing = () => {
    setEditValue(currentValue);
    setStatus('editing');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  if (status === 'editing' || status === 'saving' || status === 'saved' || status === 'error') {
    const label = dbField === 'display_name'
      ? getCopy(theme, 'profile.labelName')
      : getCopy(theme, 'profile.labelBio');

    return (
      <div className="passport-edit-field passport-head-edit">
        <span className="passport-edit-label">{label}</span>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="passport-edit-input"
          disabled={status === 'saving'}
          autoFocus
        />
        {status === 'saved' && (
          <span className="passport-save-indicator passport-save-ok">
            {getCopy(theme, 'profile.saveSuccess')}
          </span>
        )}
        {status === 'error' && (
          <span
            className="passport-save-indicator passport-save-err"
            onClick={save}
          >
            {getCopy(theme, 'profile.saveFailed')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} passport-editable`} onClick={startEditing}>
      {currentValue || placeholder}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export function ProfileEditor({ profile }: { profile: PassportProfile }) {
  const theme: ThemeId = 'just-because';
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = profile.displayName.charAt(0).toUpperCase();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPhotoError(false);
    const url = await uploadProfilePhoto(profile.id, file);
    if (url) {
      const result = await updateProfile({ profile_photo_url: url });
      if (result.ok) {
        setPhotoUrl(url);
      } else {
        setPhotoError(true);
      }
    } else {
      setPhotoError(true);
    }
    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Profile head */}
      <div className="passport-head">
        <div className="passport-avatar-wrap">
          <div
            className="passport-avatar"
            style={photoUrl ? {
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {uploading ? (
              <span className="passport-avatar-spinner">⏳</span>
            ) : (
              !photoUrl && initial
            )}
          </div>
          <button
            className="passport-avatar-badge"
            onClick={() => fileInputRef.current?.click()}
            aria-label="change photo"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: 'none' }}
          />
        </div>
        {photoError && (
          <p
            className="passport-photo-error"
            onClick={() => fileInputRef.current?.click()}
          >
            {getCopy(theme, 'profile.photoFailed')}
          </p>
        )}

        <InlineHeadField
          value={profile.displayName}
          placeholder={getCopy(theme, 'profile.placeholderName')}
          dbField="display_name"
          className="passport-name"
          theme={theme}
        />
        <InlineHeadField
          value={profile.bio || ''}
          placeholder={getCopy(theme, 'profile.placeholderBio')}
          dbField="bio"
          className="passport-handle"
          theme={theme}
        />
      </div>

      {/* Your info details card */}
      <div className="passport-details-card">
        <div className="passport-details-title">
          {getCopy(theme, 'profile.infoTitle')}
        </div>

        <InlineField
          label={getCopy(theme, 'profile.labelEmail')}
          value={profile.email || ''}
          placeholder={getCopy(theme, 'profile.placeholderEmail')}
          dbField="email"
          type="email"
          theme={theme}
        />

        <InlineField
          label={getCopy(theme, 'profile.labelPhone')}
          value={profile.phone || ''}
          placeholder={getCopy(theme, 'profile.placeholderPhone')}
          dbField="phone"
          type="tel"
          theme={theme}
        />

        <InlineField
          label={getCopy(theme, 'profile.labelInsta')}
          value={profile.instagramHandle || ''}
          placeholder={getCopy(theme, 'profile.placeholderHandle')}
          dbField="instagram_handle"
          stripAt
          theme={theme}
        />

        <InlineField
          label={getCopy(theme, 'profile.labelTiktok')}
          value={profile.tiktokHandle || ''}
          placeholder={getCopy(theme, 'profile.placeholderHandle')}
          dbField="tiktok_handle"
          stripAt
          theme={theme}
        />

        <InlineField
          label={getCopy(theme, 'profile.labelCity')}
          value={profile.homeCity || ''}
          placeholder={getCopy(theme, 'profile.placeholderCity')}
          dbField="home_city"
          theme={theme}
        />
      </div>
    </>
  );
}
