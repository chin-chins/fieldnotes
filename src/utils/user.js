import { supabase } from '../client.js';

// store the current user ID in browser storage so the app can reuse it after refreshes
const USER_STORAGE_KEY = 'sidequest_user_id';

// create a temp ID for the browser if supabase hasn't provided a real user yet.
export const createFallbackUserId = () => {
  return 'user_' + Math.random().toString(36).substring(2, 9);
};

// access the browser's storage safely so this helper also works in tests
const getStorage = () => {
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return null;
};

// read the saved ID from localStorage when it exists
export const getStoredUserId = () => {
  const storage = getStorage();
  if (!storage) return null;
  return storage.getItem(USER_STORAGE_KEY);
};

// save resolved user ID so future renders can reuse it
export const setStoredUserId = (userId) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(USER_STORAGE_KEY, userId);
};

// helper for any code that needs to get user ID quickly 
export const getUserId = () => {
  const storedUserId = getStoredUserId();

  if (storedUserId) return storedUserId;

  const fallbackUserId = createFallbackUserId();
  setStoredUserId(fallbackUserId);
  return fallbackUserId;
};

// resolve active user ID by checking supabase auth first, then falling back to anonymous auth
export const ensureUserId = async () => {
  const storedUserId = getStoredUserId();
  if (storedUserId) return storedUserId;

  try {
    // ask supabase whether the browser already has a logged-in user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      setStoredUserId(user.id);
      return user.id;
    }
  } catch (error) {
    console.error('Unable to resolve Supabase user:', error);
  }

  try {
    // if no signed-in user, start an anonymous supabase session
    const { data, error } = await supabase.auth.signInAnonymously();

    if (!error && data?.user?.id) {
      setStoredUserId(data.user.id);
      return data.user.id;
    }
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
  }

  // final fallback: create a local ID when auth is unavailable/fails
  const fallbackUserId = createFallbackUserId();
  setStoredUserId(fallbackUserId);
  return fallbackUserId;
};