import { useState, useEffect } from 'react';

// Generic localStorage hook
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Error loading ${key} from localStorage:`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }, [key, value]);

  return [value, setValue];
};

// Simple value localStorage hook (for strings/numbers)
export const useSimpleLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return saved;
      }
    } catch (e) {
      console.error(`Error loading ${key} from localStorage:`, e);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value.toString());
      }
    } catch (e) {
      console.error(`Error saving ${key} to localStorage:`, e);
    }
  }, [key, value]);

  return [value, setValue];
};

