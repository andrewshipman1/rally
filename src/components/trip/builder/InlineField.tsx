'use client';

// Dashed-border inline field shell. Renders as a placeholder display
// when empty and inactive; swaps to a real <input> or <textarea> on
// focus. Keystrokes fire onChange up to the parent, which is
// responsible for calling the autosave queue. Native inputs are used
// deliberately over contenteditable — they give free mobile keyboard
// handling, native date pickers on `type="date"`, and proper
// accessibility semantics.

import { useRef, useState } from 'react';

export type InlineFieldVariant = 'title' | 'tagline' | 'when' | 'where' | 'start' | 'end' | 'rsvp-by';

type Props = {
  variant: InlineFieldVariant;
  label: string;
  placeholder: string;
  value: string | null;
  /** Native input type for single-line fields. Defaults to 'text'. */
  inputType?: 'text' | 'date';
  onChange: (next: string) => void;
  /** Max value for date inputs. */
  max?: string;
};

export function InlineField({ variant, label, placeholder, value, inputType = 'text', onChange, max }: Props) {
  const [active, setActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const filled = !!(value && value.length > 0);
  const className = [
    'field',
    `field-${variant}`,
    filled ? 'filled' : '',
    active ? 'active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const showInput = active || filled;

  const handleActivate = () => {
    setActive(true);
    // Defer focus so the <input> exists when we call focus().
    // 8L-followup: for date variants, also call showPicker() so the
    // native calendar opens on the first tap rather than leaving the
    // user in an empty text-input limbo. Optional-chain guards older
    // browsers that don't implement HTMLInputElement.showPicker.
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      if (inputType === 'date' && el instanceof HTMLInputElement) {
        try {
          el.showPicker?.();
        } catch {
          // showPicker can throw if not triggered by a user gesture
          // in some browsers — swallow silently, the focus is enough.
        }
      }
    });
  };

  const commonInputProps = {
    className: 'field-input',
    value: value ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur: () => setActive(false),
  };

  return (
    <div className={className} onClick={!showInput ? handleActivate : undefined}>
      <div className="field-label">{label}</div>
      {showInput ? (
        variant === 'tagline' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            rows={2}
            placeholder={placeholder}
            {...commonInputProps}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={inputType}
            placeholder={placeholder}
            max={max}
            {...commonInputProps}
          />
        )
      ) : (
        <div className="placeholder">{placeholder}</div>
      )}
    </div>
  );
}
