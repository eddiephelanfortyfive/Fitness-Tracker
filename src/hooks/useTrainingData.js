import { useState, useEffect } from 'react';
import {
  getDefaultRunningDataLevel1,
  getDefaultRunningDataLevel2,
  getDefaultCyclingDataLevel1,
  getDefaultCyclingDataLevel2,
  getDefaultWeightDataLevel1,
  getDefaultWeightDataLevel2
} from '../data/defaultData';
import { workoutDaysLevel1, workoutDaysLevel2 } from '../data/workoutPlans';

// Hook for running data
export const useRunningData = (activeLevel) => {
  const [runningData, setRunningData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_runningData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all entries have interval properties, and populate from defaults if missing
        if (Array.isArray(parsed)) {
          return parsed.map(r => {
            const base = {
              ...r,
              intervalStructure: r.intervalStructure || '',
              intervalRounds: r.intervalRounds || 0,
              restTime: r.restTime || '',
              status: r.status || 'not_done'
            };
            
            // If this is an interval run but missing structure, populate from defaults
            if (r.type === 'Interval' && (!r.intervalStructure || r.intervalStructure === '')) {
              if (activeLevel === 1) {
                // Level 1: Week 6-8, Run 1 (Tuesday) - 5KM intervals
                if (r.week >= 6 && (r.run === 1 || r.day === 'Tuesday')) {
                  base.intervalStructure = '1KM Easy @ 60% HR → 500m Hard @ 85% HR → 1KM Easy @ 60% HR → 1KM Hard @ 85% HR → 1KM Easy @ 60% HR → 500m Hard @ 85% HR';
                  base.intervalRounds = 1;
                  base.restTime = 'Active recovery (easy pace segments @ 60% HR)';
                }
              } else {
                // Level 2: Week 6-10, Run 2 (Wednesday) - 5KM intervals
                if (r.week >= 6 && (r.run === 2 || r.day === 'Wednesday')) {
                  base.intervalStructure = '1KM Easy @ 60% HR → 1KM Hard @ 85% HR';
                  base.intervalRounds = 4;
                  base.restTime = 'Active recovery (easy pace segments @ 60% HR)';
                }
              }
            }
            
            return base;
          });
        }
        return activeLevel === 1 ? getDefaultRunningDataLevel1() : getDefaultRunningDataLevel2();
      }
    } catch (e) {
      console.error('Error loading running data from localStorage:', e);
    }
    return activeLevel === 1 ? getDefaultRunningDataLevel1() : getDefaultRunningDataLevel2();
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_runningData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = Array.isArray(parsed) ? parsed.map(r => ({
          ...r,
          intervalStructure: r.intervalStructure || '',
          intervalRounds: r.intervalRounds || 0,
          restTime: r.restTime || '',
          status: r.status || 'not_done'
        })) : [];
        setRunningData(normalized);
      } else {
        setRunningData(activeLevel === 1 ? getDefaultRunningDataLevel1() : getDefaultRunningDataLevel2());
      }
    } catch (e) {
      console.error('Error loading running data for level:', e);
      setRunningData(activeLevel === 1 ? getDefaultRunningDataLevel1() : getDefaultRunningDataLevel2());
    }
  }, [activeLevel]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_runningData_level${activeLevel}`, JSON.stringify(runningData));
    } catch (e) {
      console.error('Error saving running data to localStorage:', e);
    }
  }, [runningData, activeLevel]);

  const updateRunning = (index, field, value) => {
    const newData = [...runningData];
    newData[index][field] = value;
    
    if (field === 'duration' || field === 'distance') {
      const duration = field === 'duration' ? parseFloat(value) : parseFloat(newData[index].duration);
      const distance = field === 'distance' ? parseFloat(value) : parseFloat(newData[index].distance);
      
      if (duration && distance) {
        const pace = (distance / (duration / 60)).toFixed(2);
        newData[index].pace = pace;
      }
    }
    
    setRunningData(newData);
  };

  return { runningData, setRunningData, updateRunning };
};

// Hook for cycling data
export const useCyclingData = (activeLevel) => {
  const [cyclingData, setCyclingData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_cyclingData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize existing data - add status if missing
        const normalized = Array.isArray(parsed) ? parsed.map(c => ({
          ...c,
          status: c.status || 'not_done'
        })) : [];
        return normalized;
      }
    } catch (e) {
      console.error('Error loading cycling data from localStorage:', e);
    }
    return activeLevel === 1 ? getDefaultCyclingDataLevel1() : getDefaultCyclingDataLevel2();
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_cyclingData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = Array.isArray(parsed) ? parsed.map(c => ({
          ...c,
          status: c.status || 'not_done'
        })) : [];
        setCyclingData(normalized);
      } else {
        setCyclingData(activeLevel === 1 ? getDefaultCyclingDataLevel1() : getDefaultCyclingDataLevel2());
      }
    } catch (e) {
      console.error('Error loading cycling data for level:', e);
      setCyclingData(activeLevel === 1 ? getDefaultCyclingDataLevel1() : getDefaultCyclingDataLevel2());
    }
  }, [activeLevel]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_cyclingData_level${activeLevel}`, JSON.stringify(cyclingData));
    } catch (e) {
      console.error('Error saving cycling data to localStorage:', e);
    }
  }, [cyclingData, activeLevel]);

  const updateCycling = (index, field, value) => {
    const newData = [...cyclingData];
    newData[index][field] = value;
    
    if (field === 'duration' || field === 'distance') {
      const duration = field === 'duration' ? parseFloat(value) : parseFloat(newData[index].duration);
      const distance = field === 'distance' ? parseFloat(value) : parseFloat(newData[index].distance);
      
      if (duration && distance) {
        const pace = (distance / (duration / 60)).toFixed(2);
        newData[index].pace = pace;
      }
    }
    
    setCyclingData(newData);
  };

  return { cyclingData, setCyclingData, updateCycling };
};

// Hook for weight training data
export const useWeightData = (activeLevel) => {
  const workoutDays = activeLevel === 1 ? workoutDaysLevel1 : workoutDaysLevel2;
  
  const [weightData, setWeightData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_weightData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize existing data - add status if missing
        const normalized = Array.isArray(parsed) ? parsed.map(w => ({
          ...w,
          status: w.status || 'not_done'
        })) : [];
        return normalized;
      }
    } catch (e) {
      console.error('Error loading weight data from localStorage:', e);
    }
    return activeLevel === 1 ? getDefaultWeightDataLevel1(workoutDaysLevel1) : getDefaultWeightDataLevel2(workoutDaysLevel2);
  });

  // Update data when level changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_weightData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = Array.isArray(parsed) ? parsed.map(w => ({
          ...w,
          status: w.status || 'not_done'
        })) : [];
        setWeightData(normalized);
      } else {
        setWeightData(activeLevel === 1 ? getDefaultWeightDataLevel1(workoutDaysLevel1) : getDefaultWeightDataLevel2(workoutDaysLevel2));
      }
    } catch (e) {
      console.error('Error loading weight data for level:', e);
      setWeightData(activeLevel === 1 ? getDefaultWeightDataLevel1(workoutDaysLevel1) : getDefaultWeightDataLevel2(workoutDaysLevel2));
    }
  }, [activeLevel]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(`fitnessTracker_weightData_level${activeLevel}`, JSON.stringify(weightData));
    } catch (e) {
      console.error('Error saving weight data to localStorage:', e);
    }
  }, [weightData, activeLevel]);

  const updateWeight = (exerciseIndex, setIndex, field, value) => {
    const newData = [...weightData];
    if (newData[exerciseIndex].sets[setIndex]) {
      newData[exerciseIndex].sets[setIndex][field] = value;
      setWeightData(newData);
    }
  };

  const updateNumSets = (index, numSets) => {
    const newData = [...weightData];
    const numSetsInt = parseInt(numSets) || 0;
    newData[index].numSets = numSetsInt;
    
    // Create or adjust sets array
    const currentSets = newData[index].sets || [];
    if (numSetsInt > currentSets.length) {
      // Add new sets
      for (let i = currentSets.length; i < numSetsInt; i++) {
        currentSets.push({
          set: i + 1,
          weight: '',
          reps: '',
          rpe: '',
          notes: ''
        });
      }
    } else if (numSetsInt < currentSets.length) {
      // Remove excess sets
      currentSets.splice(numSetsInt);
    }
    newData[index].sets = currentSets;
    setWeightData(newData);
  };

  return { weightData, setWeightData, updateWeight, updateNumSets };
};

