import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { saveDraft, loadDraft, clearDraft } from '../persistence/localStorageAdapter';
import { Draft } from '../types/draft';

const mockStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Helper to attach mock to global window
function setWindowStorage() {
  // @ts-ignore
  global.window = { localStorage: mockStorage } as any;
}

function clearWindowStorage() {
  // @ts-ignore
  delete (global as any).window;
}

describe('localStorageAdapter', () => {
  beforeEach(() => {
    mockStorage.clear();
    setWindowStorage();
  });

  afterEach(() => {
    clearWindowStorage();
  });

  const draft: Draft = {
    id: 'draft-123',
    subject: 'Test Subject',
    body: 'Test body content',
    recipients: ['alice@example.com'],
  };

  it('saves a draft to localStorage', () => {
    saveDraft(draft);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    const [key, value] = mockStorage.setItem.mock.calls[0];
    expect(key).toBe('demoAdminDraft');
    expect(JSON.parse(value as string)).toEqual(draft);
  });

  it('loads a draft from localStorage', () => {
    // Pre‑populate mock storage
    mockStorage.setItem('demoAdminDraft', JSON.stringify(draft));
    const loaded = loadDraft();
    expect(mockStorage.getItem).toHaveBeenCalledWith('demoAdminDraft');
    expect(loaded).toEqual(draft);
  });

  it('returns null when no draft is stored', () => {
    const loaded = loadDraft();
    expect(loaded).toBeNull();
  });

  it('clears the stored draft', () => {
    // Store first
    saveDraft(draft);
    clearDraft();
    expect(mockStorage.removeItem).toHaveBeenCalledWith('demoAdminDraft');
    // After clearing, loadDraft should return null
    const afterClear = loadDraft();
    expect(afterClear).toBeNull();
  });
});
