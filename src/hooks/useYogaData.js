import { useState, useEffect } from 'react';
import { mmssToDecimal } from '../utils/timeFormat';

// Hook for yoga data
export const useYogaData = (activeLevel) => {
  const [yogaData, setYogaData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_yogaData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize existing data - add status if missing
        const normalized = Array.isArray(parsed) ? parsed.map(y => ({
          ...y,
          status: y.status || 'not_done'
        })) : [];
        return normalized;
      }
    } catch (e) {
      console.error('Error loading yoga data from localStorage:', e);
    }
    return [];
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_yogaData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = Array.isArray(parsed) ? parsed.map(y => ({
          ...y,
          status: y.status || 'not_done'
        })) : [];
        setYogaData(normalized);
      } else {
        setYogaData([]);
      }
    } catch (e) {
      console.error('Error loading yoga data for level:', e);
      setYogaData([]);
    }
  }, [activeLevel]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_yogaData_level${activeLevel}`, JSON.stringify(yogaData));
    } catch (e) {
      console.error('Error saving yoga data to localStorage:', e);
    }
  }, [yogaData, activeLevel]);

  const updateYoga = (index, field, value) => {
    const newData = [...yogaData];
    
    // Convert MM:SS to decimal if needed for storage
    if (field === 'duration' && value && typeof value === 'string' && value.includes(':')) {
      newData[index][field] = value; // Keep as MM:SS string
    } else {
      newData[index][field] = value;
    }
    
    setYogaData(newData);
  };

  // Function to get or create yoga entry for a specific week/day
  const getOrCreateYogaEntry = (week, day) => {
    const existing = yogaData.find(y => y.week === week && y.day === day);
    if (existing) {
      return existing;
    }
    
    // Create new entry
    const newEntry = {
      week,
      day,
      duration: '',
      status: 'not_done'
    };
    
    const newData = [...yogaData, newEntry];
    setYogaData(newData);
    return newEntry;
  };

  return { yogaData, setYogaData, updateYoga, getOrCreateYogaEntry };
};
