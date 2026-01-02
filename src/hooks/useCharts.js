import { useMemo } from 'react';
import { mmssToDecimal } from '../utils/timeFormat';

// Hook for running charts data
export const useRunningCharts = (runningData, activeLevel, maxWeeks) => {
  const runningDistanceData = useMemo(() => {
    const runTypes = activeLevel === 1 
      ? [{ day: 'Monday', label: 'Run 1' }, { day: 'Wednesday', label: 'Run 2' }, { day: 'Saturday', label: 'Run 3' }]
      : [{ day: 'Monday', label: 'Run 1' }, { day: 'Wednesday', label: 'Run 2' }, { day: 'Saturday', label: 'Run 3' }];
    
    const datasets = runTypes.map((runType, idx) => {
      const data = [];
      for (let week = 1; week <= maxWeeks; week++) {
        const run = runningData.find(r => r.week === week && r.day === runType.day && r.type === 'Steady');
        data.push(run && run.distance ? parseFloat(run.distance) : null);
      }
      return {
        label: runType.label,
        data: data,
        borderColor: idx === 0 ? 'rgb(59, 130, 246)' : idx === 1 ? 'rgb(34, 197, 94)' : 'rgb(168, 85, 247)',
        backgroundColor: idx === 0 ? 'rgba(59, 130, 246, 0.1)' : idx === 1 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      };
    });

    return {
      labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
      datasets: datasets
    };
  }, [runningData, activeLevel, maxWeeks]);

  const runningPaceData = useMemo(() => {
    const runTypes = activeLevel === 1 
      ? [{ day: 'Monday', label: 'Run 1' }, { day: 'Wednesday', label: 'Run 2' }, { day: 'Saturday', label: 'Run 3' }]
      : [{ day: 'Monday', label: 'Run 1' }, { day: 'Wednesday', label: 'Run 2' }, { day: 'Saturday', label: 'Run 3' }];
    
    const datasets = runTypes.map((runType, idx) => {
      const data = [];
      for (let week = 1; week <= maxWeeks; week++) {
        const run = runningData.find(r => r.week === week && r.day === runType.day && r.type === 'Steady');
        if (run && run.pace) {
          // Convert MM:SS pace to decimal minutes for charting
          const paceDecimal = typeof run.pace === 'string' && run.pace.includes(':')
            ? mmssToDecimal(run.pace)
            : parseFloat(run.pace);
          data.push(!isNaN(paceDecimal) ? paceDecimal : null);
        } else {
          data.push(null);
        }
      }
      return {
        label: runType.label,
        data: data,
        borderColor: idx === 0 ? 'rgb(59, 130, 246)' : idx === 1 ? 'rgb(34, 197, 94)' : 'rgb(168, 85, 247)',
        backgroundColor: idx === 0 ? 'rgba(59, 130, 246, 0.1)' : idx === 1 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      };
    });

    return {
      labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
      datasets: datasets
    };
  }, [runningData, activeLevel, maxWeeks]);

  return { runningDistanceData, runningPaceData };
};

// Hook for cycling charts data
export const useCyclingCharts = (cyclingData, maxWeeks) => {
  const cyclingDistanceData = useMemo(() => ({
    labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
    datasets: [{
      label: 'Cycling Distance (km)',
      data: [...Array(maxWeeks)].map((_, i) => {
        const week = i + 1;
        const weekData = cyclingData.filter(c => c.week === week);
        const totalDistance = weekData.reduce((sum, segment) => {
          return sum + (segment.distance ? parseFloat(segment.distance) : 0);
        }, 0);
        return totalDistance > 0 ? totalDistance : null;
      }),
      backgroundColor: 'rgba(34, 197, 94, 0.6)',
      borderColor: 'rgb(34, 197, 94)',
      borderWidth: 2
    }]
  }), [cyclingData, maxWeeks]);

  const cyclingPaceData = useMemo(() => ({
    labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
    datasets: [{
      label: 'Average Pace (min/km)',
      data: [...Array(maxWeeks)].map((_, i) => {
        const week = i + 1;
        const weekData = cyclingData.filter(c => c.week === week && c.pace);
        if (weekData.length === 0) return null;
        // Convert MM:SS pace to decimal minutes for charting
        const paceValues = weekData.map(segment => {
          if (typeof segment.pace === 'string' && segment.pace.includes(':')) {
            return mmssToDecimal(segment.pace);
          }
          return parseFloat(segment.pace);
        }).filter(v => !isNaN(v));
        if (paceValues.length === 0) return null;
        const avgPace = paceValues.reduce((sum, pace) => sum + pace, 0) / paceValues.length;
        return avgPace;
      }),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }), [cyclingData, maxWeeks]);

  return { cyclingDistanceData, cyclingPaceData };
};

// Hook for body weight charts data
export const useBodyWeightCharts = (weightLogData, targetWeight, maxWeeks) => {
  const bodyWeightTrendData = useMemo(() => {
    if (weightLogData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const sortedData = [...weightLogData].sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return new Date(a.date) - new Date(b.date);
    });
    
    const labels = sortedData.map(entry => 
      `Week ${entry.week} (${new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
    );
    const weights = sortedData.map(entry => entry.weight);
    
    const datasets = [{
      label: 'Weight (kg)',
      data: weights,
      borderColor: 'rgb(6, 182, 212)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: 'rgb(6, 182, 212)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }];
    
    // Add target weight line if set
    if (targetWeight !== null) {
      datasets.push({
        label: 'Target Weight',
        data: new Array(weights.length).fill(targetWeight),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      });
    }
    
    return { labels, datasets };
  }, [weightLogData, targetWeight]);

  const bodyWeightWeeklyData = useMemo(() => {
    // Calculate average weight per week
    const weeklyAverages = [...Array(maxWeeks)].map((_, i) => {
      const week = i + 1;
      const weekEntries = weightLogData.filter(entry => entry.week === week);
      if (weekEntries.length === 0) return null;
      const sum = weekEntries.reduce((acc, entry) => acc + entry.weight, 0);
      return sum / weekEntries.length;
    });
    
    const labels = [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`);
    
    const datasets = [{
      label: 'Average Weight (kg)',
      data: weeklyAverages,
      backgroundColor: weeklyAverages.map(avg => 
        avg === null ? 'rgba(148, 163, 184, 0.3)' : 'rgba(6, 182, 212, 0.8)'
      ),
      borderColor: weeklyAverages.map(avg => 
        avg === null ? 'rgb(148, 163, 184)' : 'rgb(6, 182, 212)'
      ),
      borderWidth: 2
    }];
    
    // Add target weight line if set
    if (targetWeight !== null) {
      datasets.push({
        label: 'Target Weight',
        data: new Array(maxWeeks).fill(targetWeight),
        type: 'line',
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      });
    }
    
    return { labels, datasets };
  }, [weightLogData, targetWeight, maxWeeks]);

  return { bodyWeightTrendData, bodyWeightWeeklyData };
};

// Hook for weight training charts data
export const useWeightTrainingCharts = (weightData, workoutDays, maxWeeks) => {
  const getWeightChartData = (exerciseName, day) => {
    const exerciseData = weightData.filter(
      w => w.exercise === exerciseName && w.day === day
    );
    
    const weeklyData = [];
    for (let week = 1; week <= maxWeeks; week++) {
      const weekExercises = exerciseData.filter(e => e.week === week);
      if (weekExercises.length > 0 && weekExercises[0].sets && weekExercises[0].sets.length > 0) {
        const weights = weekExercises[0].sets
          .map(s => s.weight ? parseFloat(s.weight) : 0)
          .filter(w => w > 0);
        if (weights.length > 0) {
          const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;
          weeklyData.push(avgWeight);
        } else {
          weeklyData.push(null);
        }
      } else {
        weeklyData.push(null);
      }
    }
    
    return {
      labels: [...Array(maxWeeks)].map((_, i) => `W${i + 1}`),
      datasets: [{
        label: 'Average Weight (kg)',
        data: weeklyData,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };
  };

  return { getWeightChartData };
};

// Hook for cold exposure charts data
export const useColdExposureCharts = (coldExposureData) => {
  const coldExposureDurationData = useMemo(() => {
    if (coldExposureData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Sort by date (oldest first for chart)
    const sortedData = [...coldExposureData].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    // Group by date and calculate total duration per day
    const dailyData = {};
    sortedData.forEach(entry => {
      if (entry.duration) {
        const dateKey = entry.date;
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = 0;
        }
        // Convert MM:SS to decimal minutes
        const durationDecimal = typeof entry.duration === 'string' && entry.duration.includes(':')
          ? mmssToDecimal(entry.duration)
          : parseFloat(entry.duration);
        if (!isNaN(durationDecimal)) {
          dailyData[dateKey] += durationDecimal;
        }
      }
    });
    
    const labels = Object.keys(dailyData).sort().map(date => 
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const durations = Object.keys(dailyData).sort().map(date => dailyData[date]);
    
    return {
      labels,
      datasets: [{
        label: 'Duration (minutes)',
        data: durations,
        borderColor: 'rgb(6, 182, 212)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(6, 182, 212)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    };
  }, [coldExposureData]);

  const coldExposureMethodData = useMemo(() => {
    if (coldExposureData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Count entries by method
    const methodCounts = {
      shower: 0,
      ice_bath: 0,
      sea_river_swim: 0
    };
    
    coldExposureData.forEach(entry => {
      if (entry.method && methodCounts.hasOwnProperty(entry.method)) {
        methodCounts[entry.method]++;
      }
    });
    
    const methodLabels = {
      shower: 'Shower',
      ice_bath: 'Ice Bath',
      sea_river_swim: 'Sea/River Swim'
    };
    
    return {
      labels: Object.keys(methodCounts).map(method => methodLabels[method]),
      datasets: [{
        label: 'Number of Sessions',
        data: Object.values(methodCounts),
        backgroundColor: [
          'rgba(6, 182, 212, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(6, 182, 212)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }]
    };
  }, [coldExposureData]);

  return { coldExposureDurationData, coldExposureMethodData };
};

// Hook for yoga charts data
export const useYogaCharts = (yogaData, maxWeeks) => {
  const yogaDurationData = useMemo(() => {
    if (!yogaData || !Array.isArray(yogaData) || yogaData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // Calculate total duration per week
    const weeklyData = [...Array(maxWeeks)].map((_, i) => {
      const week = i + 1;
      const weekYoga = yogaData.filter(y => y.week === week && y.duration);
      if (weekYoga.length === 0) return null;
      
      // Convert MM:SS to decimal minutes and sum
      const totalMinutes = weekYoga.reduce((sum, entry) => {
        const durationDecimal = typeof entry.duration === 'string' && entry.duration.includes(':')
          ? mmssToDecimal(entry.duration)
          : parseFloat(entry.duration);
        return sum + (isNaN(durationDecimal) ? 0 : durationDecimal);
      }, 0);
      
      return totalMinutes > 0 ? totalMinutes : null;
    });
    
    return {
      labels: [...Array(maxWeeks)].map((_, i) => `Week ${i + 1}`),
      datasets: [{
        label: 'Total Duration (minutes)',
        data: weeklyData,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2
      }]
    };
  }, [yogaData, maxWeeks]);

  return { yogaDurationData };
};
