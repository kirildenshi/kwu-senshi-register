'use client';

import { useEffect, useRef } from 'react';

const DRAFT_KEY = 'kwu-senshi:registration-draft';
const SAVE_DEBOUNCE_MS = 2000;

// Fields to exclude from draft storage
const EXCLUDED_FIELDS = ['password', 'confirmPassword'];

interface DraftData {
  version: number;
  savedAt: number;
  values: Record<string, unknown>;
}

export function useDraftAutosave(
  values: Record<string, unknown>,
  configVersion: number,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const filtered: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(values)) {
        if (EXCLUDED_FIELDS.includes(key)) continue;
        // Skip File objects
        if (typeof window !== 'undefined' && value instanceof File) continue;
        if (value !== undefined && value !== '') {
          filtered[key] = value;
        }
      }

      if (Object.keys(filtered).length > 0) {
        const draft: DraftData = {
          version: configVersion,
          savedAt: Date.now(),
          values: filtered,
        };
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch (err) {
          console.warn('[autosave] localStorage write failed:', err);
        }
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [values, configVersion]);
}

export function loadDraft(configVersion: number): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;

    const draft: DraftData = JSON.parse(raw);

    // Discard if version mismatch
    if (draft.version !== configVersion) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }

    return draft.values;
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
