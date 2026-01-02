import { useState, useEffect } from 'react';

// Migration: Copy old start date to both levels if it exists
const migrateStartDate = () => {
  try {
    const oldKey = 'fitnessTracker_programStartDate';
    const level1Key = 'fitnessTracker_programStartDate_level1';
    const level2Key = 'fitnessTracker_programStartDate_level2';
    
    const oldDate = localStorage.getItem(oldKey);
    const level1Date = localStorage.getItem(level1Key);
    const level2Date = localStorage.getItem(level2Key);
    
    // If old key exists and neither level-specific key exists, migrate
    if (oldDate && !level1Date && !level2Date) {
      localStorage.setItem(level1Key, oldDate);
      localStorage.setItem(level2Key, oldDate);
      localStorage.removeItem(oldKey);
      console.log('Migrated start date to level-specific keys');
    }
  } catch (e) {
    console.error('Error migrating start date:', e);
  }
};

export const useProgramStart = (activeLevel) => {
  // Run migration on first load
  useEffect(() => {
    migrateStartDate();
  }, []);

  const getStorageKey = (level) => {
    return `fitnessTracker_programStartDate_level${level}`;
  };

  const [startDate, setStartDate] = useState(() => {
    try {
      const key = getStorageKey(activeLevel);
      const saved = localStorage.getItem(key);
      return saved ? new Date(saved) : null;
    } catch (e) {
      console.error('Error loading start date from localStorage:', e);
      return null;
    }
  });

  // Update start date when activeLevel changes
  useEffect(() => {
    try {
      const key = getStorageKey(activeLevel);
      const saved = localStorage.getItem(key);
      setStartDate(saved ? new Date(saved) : null);
    } catch (e) {
      console.error('Error loading start date for level change:', e);
      setStartDate(null);
    }
  }, [activeLevel]);

  // Save start date to level-specific key
  useEffect(() => {
    if (startDate) {
      try {
        const key = getStorageKey(activeLevel);
        localStorage.setItem(key, startDate.toISOString());
      } catch (e) {
        console.error('Error saving start date to localStorage:', e);
      }
    } else {
      try {
        const key = getStorageKey(activeLevel);
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing start date from localStorage:', e);
      }
    }
  }, [startDate, activeLevel]);

  const setProgramStartDate = (date) => {
    if (date instanceof Date) {
      setStartDate(date);
    } else if (typeof date === 'string') {
      setStartDate(new Date(date));
    } else {
      setStartDate(null);
    }
  };

  const clearStartDate = () => {
    setStartDate(null);
  };

  return { startDate, setProgramStartDate, clearStartDate };
};

