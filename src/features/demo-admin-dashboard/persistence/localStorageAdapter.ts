// src/features/demo-admin-dashboard/persistence/localStorageAdapter.ts
export interface StorageAdapter<T> {
  /** Save a value under a given key */
  save(key: string, value: T): void;
  /** Load a value by key; returns null if missing or parse error */
  load(key: string): T | null;
  /** Remove a value from storage */
  clear(key: string): void;
}

/**
 * Simple wrapper around the browser's `localStorage` that serialises values as JSON.
 * It is generic so it can be reused for any type (e.g., the Draft state).
 */
export class LocalStorageAdapter<T> implements StorageAdapter<T> {
  save(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).localStorage.setItem(key, serialized);
    } catch (e) {
      // In a demo context we simply log – production code would surface the error.
      // eslint-disable-next-line no-console
      console.error('LocalStorageAdapter.save error', e);
    }
  }

  load(key: string): T | null {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (globalThis as any).localStorage.getItem(key) as string | null;
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('LocalStorageAdapter.load error', e);
      return null;
    }
  }

  clear(key: string): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).localStorage.removeItem(key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('LocalStorageAdapter.clear error', e);
    }
  }
}

// Convenience helpers for Draft state persistence
import { Draft } from '../types/draft';

const draftAdapter = new LocalStorageAdapter<Draft>();
const DRAFT_KEY = 'demoAdminDraft';

export function saveDraft(draft: Draft): void {
  draftAdapter.save(DRAFT_KEY, draft);
}

export function loadDraft(): Draft | null {
  return draftAdapter.load(DRAFT_KEY);
}

export function clearDraft(): void {
  draftAdapter.clear(DRAFT_KEY);
}
