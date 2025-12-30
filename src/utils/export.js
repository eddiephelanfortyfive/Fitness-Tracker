// CSV export functionality

export const exportToCSV = (activeSheet, activeWeek, runningData, cyclingData, weightData, getLastWeekWeight) => {
  let csv = '';
  
  if (activeSheet === 'running') {
    csv = 'Week,Day,Run,Type,Intensity,Distance (km),Duration (min),Pace (km/h),RPE (1-5)\n';
    if (Array.isArray(runningData)) {
      runningData.filter(r => r && r.week === activeWeek).forEach(row => {
        csv += `${row.week || ''},${row.day || ''},${row.run || ''},${row.type || ''},${row.intensity || ''},${row.distance || ''},${row.duration || ''},${row.pace || ''},${row.rpe || ''}\n`;
      });
    }
  } else if (activeSheet === 'cycling') {
    csv = 'Week,Day,Segment,Duration (min),Distance (km),Pace (km/h),RPE (1-5)\n';
    cyclingData.filter(r => r.week === activeWeek).forEach(row => {
      csv += `${row.week},${row.day},${row.segment},${row.duration},${row.distance},${row.pace},${row.rpe}\n`;
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
  }
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeSheet}-week${activeWeek}-tracker.csv`;
  a.click();
};

