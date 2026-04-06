'use client';

import { useState, useRef, useEffect } from 'react';
import { searchAirports, type Airport } from '@/lib/airports';

export function AirportInput({
  value,
  onChange,
  placeholder = 'JFK',
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    onChange(text.toUpperCase());
    if (text.trim().length > 0) {
      setSuggestions(searchAirports(text));
      setOpen(true);
      setHighlight(0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const select = (airport: Airport) => {
    setQuery(airport.code);
    onChange(airport.code);
    setOpen(false);
    setSuggestions([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      {label && (
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.55)',
            display: 'block',
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => query && suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={4}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 700,
          textAlign: 'center',
          outline: 'none',
          fontFamily: "'Outfit', sans-serif",
          textTransform: 'uppercase',
          letterSpacing: 2,
          boxSizing: 'border-box',
        }}
      />
      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'rgba(20,30,40,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            zIndex: 100,
            maxHeight: 240,
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {suggestions.map((airport, i) => (
            <button
              key={airport.code}
              onClick={() => select(airport)}
              onMouseEnter={() => setHighlight(i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: i === highlight ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                textAlign: 'left',
                fontFamily: 'inherit',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 1,
                  minWidth: 38,
                }}
              >
                {airport.code}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {airport.city}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {airport.name}
                </div>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{airport.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
