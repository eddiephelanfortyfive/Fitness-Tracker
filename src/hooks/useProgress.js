import { useMemo } from 'react';
import { calculateWeekProgress, calculateOverallProgress } from '../utils/calculations';

// Hook for progress calculations
export const useProgress = (runningData, cyclingData, weightData, maxWeeks) => {
  const overallProgress = useMemo(() => {
    return calculateOverallProgress(runningData, cyclingData, weightData);
  }, [runningData, cyclingData, weightData]);

  const getWeekProgress = (week) => {
    return calculateWeekProgress(week, runningData, cyclingData, weightData);
  };

  return { overallProgress, getWeekProgress };
};

