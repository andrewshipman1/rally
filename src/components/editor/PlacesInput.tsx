'use client';

import { useState, useRef, useEffect } from 'react';

export interface PlaceResult {
  description: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleMapsLoader {
  importLibrary: (lib: string) => Promise<unknown>;
}

declare global {
  interface Window {
    google?: {
      maps: GoogleMapsLoader;
    };
  }
}

interface AutocompleteSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    toPlace: () => unknown;
  };
}

interface PlaceLite {
  fetchFields: (opts: { fields: string[] }) => Promise<void>;
  location?: { lat(): number; lng(): number };
  formattedAddress?: string;
}

let scriptLoadingPromise: Promise<boolean> | null = null;

function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.maps) return Promise.resolve(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.resolve(false);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-rally-gmaps]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('data-rally-gmaps', 'true');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Google Places autocomplete input. Falls back to plain text input
 * if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.
 *
 * Pass `types: ['(cities)']` for city-only autocomplete (trip destination).
 * Pass `types: ['address']` for full street addresses (lodging, restaurants, activities).
 */
export function PlacesInput({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  label,
  types = ['address'],
}: {
  value: string;
  onChange: (text: string) => void;
  onPlaceSelected?: (result: PlaceResult) => void;
  placeholder?: string;
  label?: string;
  types?: string[];
}) {
  const [available, setAvailable] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<unknown>(null);
  const placesLibRef = useRef<unknown>(null);

  // Try to load Google Maps once
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((ok) => {
      if (cancelled) return;
      setAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (!available || !text.trim() || !window.google?.maps) return;
    try {
      // Lazy-import the Places library
      if (!placesLibRef.current) {
        placesLibRef.current = await window.google.maps.importLibrary('places');
      }
      const places = placesLibRef.current as {
        AutocompleteSessionToken: new () => unknown;
        AutocompleteSuggestion: {
          fetchAutocompleteSuggestions: (req: {
            input: string;
            sessionToken: unknown;
            includedPrimaryTypes?: string[];
          }) => Promise<{ suggestions: AutocompleteSuggestion[] }>;
        };
      };

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new places.AutocompleteSessionToken();
      }

      const req: {
        input: string;
        sessionToken: unknown;
        includedPrimaryTypes?: string[];
      } = {
        input: text,
        sessionToken: sessionTokenRef.current,
      };

      if (types.length > 0) {
        req.includedPrimaryTypes = types;
      }

      const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
      setSuggestions(suggestions || []);
      setOpen(true);
      setHighlight(0);
    } catch {
      // Silent fail — input still works as plain text
    }
  };

  const handleChange = (text: string) => {
    onChange(text);
    if (available && text.trim().length > 1) {
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const select = async (suggestion: AutocompleteSuggestion) => {
    const description = suggestion.placePrediction.text.text;
    onChange(description);
    setOpen(false);
    setSuggestions([]);

    // Fetch coordinates if a callback was provided
    if (onPlaceSelected) {
      try {
        const place = suggestion.placePrediction.toPlace() as PlaceLite;
        await place.fetchFields({ fields: ['location', 'formattedAddress'] });
        const lat = place.location?.lat();
        const lng = place.location?.lng();
        onPlaceSelected({
          description: place.formattedAddress || description,
          latitude: typeof lat === 'number' ? lat : undefined,
          longitude: typeof lng === 'number' ? lng : undefined,
        });
      } catch {
        onPlaceSelected({ description });
      }
    }

    // Reset session token after a selection
    sessionTokenRef.current = null;
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    fontFamily: "'Outfit', sans-serif",
    boxSizing: 'border-box',
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
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={inputStyle}
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
          {suggestions.map((s, i) => (
            <button
              key={s.placePrediction.placeId}
              onClick={() => select(s)}
              onMouseEnter={() => setHighlight(i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                background: i === highlight ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fff',
                textAlign: 'left',
                fontFamily: 'inherit',
                fontSize: 13,
              }}
            >
              <span>📍</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.placePrediction.text.text}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
