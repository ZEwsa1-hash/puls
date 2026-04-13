// Generic localStorage hook with SSR-safe implementation

import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage persistence with type safety
 * @param key - localStorage key
 * @param initialValue - default value if no stored value exists
 * @returns tuple of [value, setValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (!isInitialized) return;
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isInitialized]);

  return [storedValue, setStoredValue];
}
