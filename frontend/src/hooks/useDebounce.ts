import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce rapid value updates (e.g. search keystrokes).
 * Prevents triggering an API call on every character typed.
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
