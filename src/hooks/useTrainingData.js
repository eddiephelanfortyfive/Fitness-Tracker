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
import { calculatePaceMinPerKm, isDecimalFormat, mmssToDecimal } from '../utils/timeFormat';

// Hook for running data
export const useRunningData = (activeLevel) => {
  const [runningData, setRunningData] = useState(() => {
    try {
      const saved = localStorage.getItem(`fitnessTracker_runningData_level${activeLevel}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure all entries have interval properties, and populate from defaults if missing
        if (Array.isArray(parsed)) {
          // Migration: Update old Level 1 schedule (Sunday/Tuesday/Thursday) to new schedule (Monday/Wednesday/Saturday)
          const migrated = parsed.map(r => {
            const base = {
              ...r,
              intervalStructure: r.intervalStructure || '',
              intervalRounds: r.intervalRounds || 0,
              restTime: r.restTime || '',
              status: r.status || 'not_done'
            };
            
            // Migrate Level 1 old schedule to new schedule
            if (activeLevel === 1) {
              // Old: Sunday (Run 1) -> New: Monday (Run 1)
              if (r.day === 'Sunday' && r.run === 1) {
                base.day = 'Monday';
              }
              // Old: Tuesday (Run 2) -> New: Wednesday (Run 2)
              else if (r.day === 'Tuesday' && r.run === 2) {
                base.day = 'Wednesday';
              }
              // Old: Thursday (Run 3) -> New: Saturday (Run 3)
              else if (r.day === 'Thursday' && r.run === 3) {
                base.day = 'Saturday';
              }
            }
            
            // If this is an interval run but missing structure, populate from defaults
            if (r.type === 'Interval' && (!r.intervalStructure || r.intervalStructure === '')) {
              if (activeLevel === 1) {
                // Level 1: Week 6-8, Run 2 (Wednesday) - 5KM intervals
                if (r.week >= 6 && (r.run === 2 || r.day === 'Wednesday')) {
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
            
            // Migrate pace from km/h to min/km if needed
            // Check if pace exists and is in km/h format (typically > 5, which would be unusual for min/km)
            if (r.pace && r.pace !== '') {
              const paceNum = parseFloat(r.pace);
              // If pace > 10, it's likely km/h (running pace is typically 3-8 min/km)
              // Convert km/h to min/km: min/km = 60 / km/h
              if (!isNaN(paceNum) && paceNum > 10) {
                const paceMinPerKm = 60 / paceNum;
                base.pace = calculatePaceMinPerKm(paceMinPerKm, 1); // Calculate format for 1km
              }
            }
            
            return base;
          });
          
          // Check if migration is needed (schedule or pace format)
          const needsScheduleMigration = parsed.some(r => 
            activeLevel === 1 && (r.day === 'Sunday' || r.day === 'Tuesday' || (r.day === 'Thursday' && r.run === 3))
          );
          const needsPaceMigration = parsed.some(r => {
            if (r.pace && r.pace !== '') {
              const paceNum = parseFloat(r.pace);
              return !isNaN(paceNum) && paceNum > 10; // Likely km/h format
            }
            return false;
          });
          
          if (needsScheduleMigration || needsPaceMigration) {
            localStorage.setItem(`fitnessTracker_runningData_level${activeLevel}`, JSON.stringify(migrated));
          }
          
          return migrated;
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
        if (Array.isArray(parsed)) {
          // Migration: Update old Level 1 schedule (Sunday/Tuesday/Thursday) to new schedule (Monday/Wednesday/Saturday)
          const normalized = parsed.map(r => {
            const base = {
              ...r,
              intervalStructure: r.intervalStructure || '',
              intervalRounds: r.intervalRounds || 0,
              restTime: r.restTime || '',
              status: r.status || 'not_done'
            };
            
            // Migrate Level 1 old schedule to new schedule
            if (activeLevel === 1) {
              // Old: Sunday (Run 1) -> New: Monday (Run 1)
              if (r.day === 'Sunday' && r.run === 1) {
                base.day = 'Monday';
              }
              // Old: Tuesday (Run 2) -> New: Wednesday (Run 2)
              else if (r.day === 'Tuesday' && r.run === 2) {
                base.day = 'Wednesday';
              }
              // Old: Thursday (Run 3) -> New: Saturday (Run 3)
              else if (r.day === 'Thursday' && r.run === 3) {
                base.day = 'Saturday';
              }
            }
            
            // Migrate pace from km/h to min/km if needed
            if (r.pace && r.pace !== '') {
              const paceNum = parseFloat(r.pace);
              // If pace > 10, it's likely km/h (running pace is typically 3-8 min/km)
              if (!isNaN(paceNum) && paceNum > 10) {
                const paceMinPerKm = 60 / paceNum;
                base.pace = calculatePaceMinPerKm(paceMinPerKm, 1);
              }
            }
            
            return base;
          });
          
          // Check if migration is needed
          const needsScheduleMigration = parsed.some(r => 
            activeLevel === 1 && (r.day === 'Sunday' || r.day === 'Tuesday' || (r.day === 'Thursday' && r.run === 3))
          );
          const needsPaceMigration = parsed.some(r => {
            if (r.pace && r.pace !== '') {
              const paceNum = parseFloat(r.pace);
              return !isNaN(paceNum) && paceNum > 10;
            }
            return false;
          });
          
          if (needsScheduleMigration || needsPaceMigration) {
            localStorage.setItem(`fitnessTracker_runningData_level${activeLevel}`, JSON.stringify(normalized));
          }
          
          setRunningData(normalized);
        } else {
          setRunningData(activeLevel === 1 ? getDefaultRunningDataLevel1() : getDefaultRunningDataLevel2());
        }
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
    
    // Convert MM:SS to decimal if needed for storage
    if (field === 'duration' && value && typeof value === 'string' && value.includes(':')) {
      newData[index][field] = mmssToDecimal(value);
    } else {
      newData[index][field] = value;
    }
    
    if (field === 'duration' || field === 'distance') {
      let duration = field === 'duration' 
        ? (value && typeof value === 'string' && value.includes(':') ? mmssToDecimal(value) : parseFloat(value))
        : parseFloat(newData[index].duration);
      const distance = field === 'distance' ? parseFloat(value) : parseFloat(newData[index].distance);
      
      if (duration && distance && duration > 0 && distance > 0) {
        // Calculate pace in min/km: duration (min) / distance (km)
        const pace = calculatePaceMinPerKm(duration, distance);
        newData[index].pace = pace;
      } else if (!duration || !distance) {
        newData[index].pace = '';
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
        const normalized = Array.isArray(parsed) ? parsed.map(c => {
          const base = {
            ...c,
            status: c.status || 'not_done'
          };
          
          // Migrate pace from km/h to min/km if needed
          if (c.pace && c.pace !== '') {
            const paceNum = parseFloat(c.pace);
            // If pace > 15, it's likely km/h (cycling pace is typically 2-6 min/km)
            if (!isNaN(paceNum) && paceNum > 15) {
              const paceMinPerKm = 60 / paceNum;
              base.pace = calculatePaceMinPerKm(paceMinPerKm, 1);
            }
          }
          
          return base;
        }) : [];
        
        // Check if pace migration is needed
        const needsPaceMigration = parsed.some(c => {
          if (c.pace && c.pace !== '') {
            const paceNum = parseFloat(c.pace);
            return !isNaN(paceNum) && paceNum > 15;
          }
          return false;
        });
        
        if (needsPaceMigration) {
          localStorage.setItem(`fitnessTracker_cyclingData_level${activeLevel}`, JSON.stringify(normalized));
        }
        
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
    
    // Convert MM:SS to decimal if needed for storage
    if (field === 'duration' && value && typeof value === 'string' && value.includes(':')) {
      newData[index][field] = mmssToDecimal(value);
    } else {
      newData[index][field] = value;
    }
    
    if (field === 'duration' || field === 'distance') {
      let duration = field === 'duration' 
        ? (value && typeof value === 'string' && value.includes(':') ? mmssToDecimal(value) : parseFloat(value))
        : parseFloat(newData[index].duration);
      const distance = field === 'distance' ? parseFloat(value) : parseFloat(newData[index].distance);
      
      if (duration && distance && duration > 0 && distance > 0) {
        // Calculate pace in min/km: duration (min) / distance (km)
        const pace = calculatePaceMinPerKm(duration, distance);
        newData[index].pace = pace;
      } else if (!duration || !distance) {
        newData[index].pace = '';
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
        // Normalize existing data - add status and weightRecommendation if missing
        const normalized = Array.isArray(parsed) ? parsed.map(w => ({
          ...w,
          status: w.status || 'not_done',
          weightRecommendation: w.weightRecommendation !== undefined ? w.weightRecommendation : null
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
          status: w.status || 'not_done',
          weightRecommendation: w.weightRecommendation !== undefined ? w.weightRecommendation : null
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

  const updateWeightRecommendation = (exerciseIndex, recommendation) => {
    const newData = [...weightData];
    if (newData[exerciseIndex]) {
      newData[exerciseIndex].weightRecommendation = recommendation;
      setWeightData(newData);
    }
  };

  return { weightData, setWeightData, updateWeight, updateNumSets, updateWeightRecommendation };
};

