import { useState, useEffect } from 'react';

// Hook for weight log data
export const useWeightLog = (activeLevel) => {
  const [weightLogData, setWeightLogData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_weightLogData_level${activeLevel}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading weight log data from localStorage:', e);
    }
    return [];
  });

  const [targetWeight, setTargetWeight] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_targetWeight_level${activeLevel}`);
      if (saved) {
        return parseFloat(saved) || null;
      }
    } catch (e) {
      console.error('Error loading target weight from localStorage:', e);
    }
    return null;
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const savedWeightLog = localStorage.getItem(`fitnessTracker_weightLogData_level${activeLevel}`);
      if (savedWeightLog) {
        setWeightLogData(JSON.parse(savedWeightLog));
      } else {
        setWeightLogData([]);
      }
      
      const savedTargetWeight = localStorage.getItem(`fitnessTracker_targetWeight_level${activeLevel}`);
      if (savedTargetWeight) {
        setTargetWeight(parseFloat(savedTargetWeight));
      } else {
        setTargetWeight(null);
      }
    } catch (e) {
      console.error('Error loading weight log data for level:', e);
      setWeightLogData([]);
      setTargetWeight(null);
    }
  }, [activeLevel]);

  // Save weight log data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_weightLogData_level${activeLevel}`, JSON.stringify(weightLogData));
    } catch (e) {
      console.error('Error saving weight log data to localStorage:', e);
    }
  }, [weightLogData, activeLevel]);

  // Save target weight to localStorage
  useEffect(() => {
    try {
      if (targetWeight !== null) {
        localStorage.setItem(`fitnessTracker_targetWeight_level${activeLevel}`, targetWeight.toString());
      }
    } catch (e) {
      console.error('Error saving target weight to localStorage:', e);
    }
  }, [targetWeight, activeLevel]);

  const addWeightEntry = (week, weight, date) => {
    const newEntry = {
      id: Date.now(), // Unique ID for each entry
      week: parseInt(week),
      weight: parseFloat(weight),
      date: date || new Date().toISOString().split('T')[0] // Default to today if no date provided
    };
    setWeightLogData([...weightLogData, newEntry].sort((a, b) => {
      // Sort by week first, then by date
      if (a.week !== b.week) return a.week - b.week;
      return new Date(a.date) - new Date(b.date);
    }));
  };

  const updateWeightEntry = (id, field, value) => {
    const newData = weightLogData.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          [field]: field === 'week' ? parseInt(value) : field === 'weight' ? parseFloat(value) : value
        };
      }
      return entry;
    });
    setWeightLogData(newData.sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return new Date(a.date) - new Date(b.date);
    }));
  };

  const deleteWeightEntry = (id) => {
    setWeightLogData(weightLogData.filter(entry => entry.id !== id));
  };

  return {
    weightLogData,
    setWeightLogData,
    targetWeight,
    setTargetWeight,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry
  };
};

