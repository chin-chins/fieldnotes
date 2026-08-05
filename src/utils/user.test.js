import test from 'node:test';
import assert from 'node:assert/strict';
import { createFallbackUserId, getStoredUserId } from './user.js';

const storage = new Map();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
  configurable: true,
});

test('creates a fallback user id with the expected prefix', () => {
  const id = createFallbackUserId();
  assert.match(id, /^user_[a-z0-9]+$/);
});

test('returns the stored user id from localStorage', () => {
  localStorage.setItem('sidequest_user_id', 'user_test123');
  assert.equal(getStoredUserId(), 'user_test123');
});
