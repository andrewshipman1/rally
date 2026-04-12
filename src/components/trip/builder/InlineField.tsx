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
};

export function InlineField({ variant, label, placeholder, value, inputType = 'text', onChange }: Props) {
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
    requestAnimationFrame(() => inputRef.current?.focus());
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
            {...commonInputProps}
          />
        )
      ) : (
        <div className="placeholder">{placeholder}</div>
      )}
    </div>
  );
}
