import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Always start with initialValue so server and initial client render match.
  const [value, setValue] = useState<T>(initialValue);

  // After hydration, read the actual stored value if one exists.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore unavailable or corrupt storage.
    }
  }, [key]);

  // Persist every change back to localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private windows; runtime state still works.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
