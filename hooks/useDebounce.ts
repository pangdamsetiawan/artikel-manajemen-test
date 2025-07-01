import { useState, useEffect } from 'react';

// Custom hook untuk debounce
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500); // delay 500ms jika tidak dispesifikasikan

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}