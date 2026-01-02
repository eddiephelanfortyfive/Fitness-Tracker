// CSV export functionality
import { decimalToMMSS } from './timeFormat';

export const exportToCSV = (activeSheet, activeWeek, runningData, cyclingData, weightData, getLastWeekWeight, coldExposureData, yogaData) => {
  let csv = '';
  
  if (activeSheet === 'running') {
    csv = 'Week,Day,Run,Type,Intensity,Distance (km),Duration (MM:SS),Pace (min/km),RPE (1-5)\n';
    if (Array.isArray(runningData)) {
      runningData.filter(r => r && r.week === activeWeek).forEach(row => {
        // Convert duration to MM:SS format for export
        const durationDisplay = row.duration 
          ? (typeof row.duration === 'string' && row.duration.includes(':') 
              ? row.duration 
              : decimalToMMSS(row.duration))
          : '';
        csv += `${row.week || ''},${row.day || ''},${row.run || ''},${row.type || ''},${row.intensity || ''},${row.distance || ''},${durationDisplay},${row.pace || ''},${row.rpe || ''}\n`;
      });
    }
  } else if (activeSheet === 'cycling') {
    csv = 'Week,Day,Segment,Duration (MM:SS),Distance (km),Pace (min/km),RPE (1-5)\n';
    cyclingData.filter(r => r.week === activeWeek).forEach(row => {
      // Convert duration to MM:SS format for export
      const durationDisplay = row.duration 
        ? (typeof row.duration === 'string' && row.duration.includes(':') 
            ? row.duration 
            : decimalToMMSS(row.duration))
        : '';
      csv += `${row.week},${row.day},${row.segment},${durationDisplay},${row.distance},${row.pace},${row.rpe}\n`;
    });
  } else if (activeSheet === 'weights') {
    csv = 'Week,Day,Workout,Exercise,Rep Range,Set,Last Week Weight,Weight (kg),Reps,RPE (1-10),Notes\n';
    weightData.filter(r => r.week === activeWeek).forEach(exercise => {
      if (exercise.sets && exercise.sets.length > 0) {
        exercise.sets.forEach(set => {
          const lastWeek = getLastWeekWeight(exercise.week, exercise.day, exercise.exercise, set.set, weightData);
          csv += `${exercise.week},${exercise.day},${exercise.workoutName},${exercise.exercise},${exercise.repRange},${set.set},${lastWeek},${set.weight},${set.reps},${set.rpe},"${set.notes}"\n`;
        });
      }
    });
  } else if (activeSheet === 'coldexposure') {
    csv = 'Date,Method,Duration (MM:SS),Temperature (°C)\n';
    if (Array.isArray(coldExposureData)) {
      const methodLabels = {
        shower: 'Shower',
        ice_bath: 'Ice Bath',
        sea_river_swim: 'Sea/River Swim'
      };
      // Sort by date (newest first) for export
      const sortedData = [...coldExposureData].sort((a, b) => new Date(b.date) - new Date(a.date));
      sortedData.forEach(entry => {
        csv += `${entry.date || ''},${methodLabels[entry.method] || entry.method || ''},${entry.duration || ''},${entry.temperature || ''}\n`;
      });
    }
  } else if (activeSheet === 'yoga') {
    csv = 'Week,Day,Duration (MM:SS),Status\n';
    if (Array.isArray(yogaData)) {
      yogaData.filter(y => y && y.week === activeWeek).forEach(row => {
        csv += `${row.week || ''},${row.day || ''},${row.duration || ''},${row.status || 'not_done'}\n`;
      });
    }
  }
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = activeSheet === 'coldexposure' 
    ? `${activeSheet}-tracker.csv`
    : `${activeSheet}-week${activeWeek}-tracker.csv`;
  a.download = filename;
  a.click();
};

