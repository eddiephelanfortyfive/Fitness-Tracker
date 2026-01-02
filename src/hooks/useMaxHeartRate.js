import { useState, useEffect } from 'react';

// Hook for maximum heart rate setting
export const useMaxHeartRate = () => {
  const [maxHeartRate, setMaxHeartRate] = useState(() => {
    try {
      const saved = localStorage.getItem('fitnessTracker_maxHeartRate');
      if (saved) {
        const parsed = parseInt(saved, 10);
        // Validate range (100-250 bpm)
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 250) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading max heart rate from localStorage:', e);
    }
    return null;
  });

  // Save to localStorage whenever maxHeartRate changes
  useEffect(() => {
    try {
      if (maxHeartRate !== null && maxHeartRate >= 100 && maxHeartRate <= 250) {
        localStorage.setItem('fitnessTracker_maxHeartRate', maxHeartRate.toString());
      } else if (maxHeartRate === null) {
        localStorage.removeItem('fitnessTracker_maxHeartRate');
      }
    } catch (e) {
      console.error('Error saving max heart rate to localStorage:', e);
    }
  }, [maxHeartRate]);

  return { maxHeartRate, setMaxHeartRate };
};
