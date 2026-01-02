import { useState, useEffect } from 'react';

// Hook for cold exposure data
export const useColdExposure = (activeLevel) => {
  const [coldExposureData, setColdExposureData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_coldExposureData_level${activeLevel}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading cold exposure data from localStorage:', e);
    }
    return [];
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_coldExposureData_level${activeLevel}`);
      if (saved) {
        setColdExposureData(JSON.parse(saved));
      } else {
        setColdExposureData([]);
      }
    } catch (e) {
      console.error('Error loading cold exposure data for level:', e);
      setColdExposureData([]);
    }
  }, [activeLevel]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_coldExposureData_level${activeLevel}`, JSON.stringify(coldExposureData));
    } catch (e) {
      console.error('Error saving cold exposure data to localStorage:', e);
    }
  }, [coldExposureData, activeLevel]);

  const addColdExposureEntry = (date, duration, method, temperature) => {
    const newEntry = {
      id: Date.now(), // Unique ID for each entry
      date: date || new Date().toISOString().split('T')[0], // Default to today if no date provided
      duration: duration || '',
      method: method || 'shower',
      temperature: temperature ? parseFloat(temperature) : null
    };
    setColdExposureData([...coldExposureData, newEntry].sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    }));
  };

  const updateColdExposureEntry = (id, field, value) => {
    const newData = coldExposureData.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          [field]: field === 'temperature' && value ? parseFloat(value) : field === 'temperature' && !value ? null : value
        };
      }
      return entry;
    });
    setColdExposureData(newData.sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    }));
  };

  const deleteColdExposureEntry = (id) => {
    setColdExposureData(coldExposureData.filter(entry => entry.id !== id));
  };

  return {
    coldExposureData,
    setColdExposureData,
    addColdExposureEntry,
    updateColdExposureEntry,
    deleteColdExposureEntry
  };
};
