// Progress calculation and helper functions

// Get workout status by type and identifier
export const getWorkoutStatus = (type, identifier, runningData, cyclingData, weightData, yogaData) => {
  if (type === 'running') {
    const workout = runningData.find(r => 
      r.week === identifier.week && 
      r.day === identifier.day && 
      r.run === identifier.run
    );
    return workout?.status || 'not_done';
  } else if (type === 'cycling') {
    // For cycling, get status from first segment (all segments share same status)
    const workout = cyclingData.find(c => 
      c.week === identifier.week && 
      c.day === identifier.day
    );
    return workout?.status || 'not_done';
  } else if (type === 'weights') {
    // For weights, get status from first exercise (all exercises share same status)
    const workout = weightData.find(w => 
      w.week === identifier.week && 
      w.day === identifier.day && 
      w.workoutName === identifier.workoutName
    );
    return workout?.status || 'not_done';
  } else if (type === 'yoga') {
    const workout = yogaData?.find(y => 
      y.week === identifier.week && 
      y.day === identifier.day
    );
    return workout?.status || 'not_done';
  }
  return 'not_done';
};

// Calculate progress for a specific week
export const calculateWeekProgress = (week, runningData, cyclingData, weightData, yogaData) => {
  const weekRunning = runningData.filter(r => r && r.week === week);
  const weekCycling = cyclingData.filter(c => c && c.week === week);
  const weekWeights = weightData.filter(w => w && w.week === week);
  const weekYoga = yogaData?.filter(y => y && y.week === week) || [];
  
  // Get unique workouts (for cycling and weights, group by day/workoutName)
  const runningWorkouts = weekRunning.length;
  const cyclingWorkouts = [...new Set(weekCycling.map(c => `${c.week}-${c.day}`))].length;
  const weightWorkouts = [...new Set(weekWeights.map(w => `${w.week}-${w.day}-${w.workoutName}`))].length;
  const yogaWorkouts = [...new Set(weekYoga.map(y => `${y.week}-${y.day}`))].length;
  
  const totalWorkouts = runningWorkouts + cyclingWorkouts + weightWorkouts + yogaWorkouts;
  
  let completed = 0;
  let skipped = 0;
  
  // Count completed/skipped running workouts
  weekRunning.forEach(r => {
    if (r.status === 'completed') completed++;
    else if (r.status === 'skipped') skipped++;
  });
  
  // Count completed/skipped cycling workouts (week-level)
  const cyclingDays = [...new Set(weekCycling.map(c => c.day))];
  cyclingDays.forEach(day => {
    const dayCycling = weekCycling.find(c => c.day === day);
    if (dayCycling?.status === 'completed') completed++;
    else if (dayCycling?.status === 'skipped') skipped++;
  });
  
  // Count completed/skipped weight workouts
  const weightWorkoutKeys = [...new Set(weekWeights.map(w => `${w.day}-${w.workoutName}`))];
  weightWorkoutKeys.forEach(key => {
    const [day, workoutName] = key.split('-');
    const workout = weekWeights.find(w => w.day === day && w.workoutName === workoutName);
    if (workout?.status === 'completed') completed++;
    else if (workout?.status === 'skipped') skipped++;
  });
  
  // Count completed/skipped yoga workouts
  weekYoga.forEach(y => {
    if (y.status === 'completed') completed++;
    else if (y.status === 'skipped') skipped++;
  });
  
  const completionRate = totalWorkouts > 0 ? (completed / totalWorkouts) * 100 : 0;
  
  return {
    total: totalWorkouts,
    completed,
    skipped,
    notDone: totalWorkouts - completed - skipped,
    completionRate: Math.round(completionRate)
  };
};

// Calculate overall progress across all weeks
export const calculateOverallProgress = (runningData, cyclingData, weightData, yogaData) => {
  let totalWorkouts = 0;
  let completed = 0;
  let skipped = 0;
  
  // Count running workouts
  const runningWorkouts = runningData.length;
  totalWorkouts += runningWorkouts;
  runningData.forEach(r => {
    if (r.status === 'completed') completed++;
    else if (r.status === 'skipped') skipped++;
  });
  
  // Count cycling workouts (unique week-day combinations)
  const cyclingWorkouts = [...new Set(cyclingData.map(c => `${c.week}-${c.day}`))].length;
  totalWorkouts += cyclingWorkouts;
  const cyclingDays = [...new Set(cyclingData.map(c => `${c.week}-${c.day}`))];
  cyclingDays.forEach(key => {
    const [week, day] = key.split('-');
    const workout = cyclingData.find(c => c.week === parseInt(week) && c.day === day);
    if (workout?.status === 'completed') completed++;
    else if (workout?.status === 'skipped') skipped++;
  });
  
  // Count weight workouts (unique week-day-workoutName combinations)
  const weightWorkouts = [...new Set(weightData.map(w => `${w.week}-${w.day}-${w.workoutName}`))].length;
  totalWorkouts += weightWorkouts;
  const weightWorkoutKeys = [...new Set(weightData.map(w => `${w.week}-${w.day}-${w.workoutName}`))];
  weightWorkoutKeys.forEach(key => {
    const [week, day, workoutName] = key.split('-');
    const workout = weightData.find(w => 
      w.week === parseInt(week) && 
      w.day === day && 
      w.workoutName === workoutName
    );
    if (workout?.status === 'completed') completed++;
    else if (workout?.status === 'skipped') skipped++;
  });
  
  // Count yoga workouts (unique week-day combinations)
  const yogaWorkouts = yogaData ? [...new Set(yogaData.map(y => `${y.week}-${y.day}`))].length : 0;
  totalWorkouts += yogaWorkouts;
  if (yogaData) {
    const yogaDays = [...new Set(yogaData.map(y => `${y.week}-${y.day}`))];
    yogaDays.forEach(key => {
      const [week, day] = key.split('-');
      const workout = yogaData.find(y => y.week === parseInt(week) && y.day === day);
      if (workout?.status === 'completed') completed++;
      else if (workout?.status === 'skipped') skipped++;
    });
  }
  
  const completionRate = totalWorkouts > 0 ? (completed / totalWorkouts) * 100 : 0;
  const currentWeek = runningData.length > 0 
    ? Math.max(...runningData.map(r => r.week).filter(w => {
        const weekData = runningData.filter(rd => rd.week === w);
        return weekData.some(rd => rd.status === 'completed');
      }), 0)
    : 0;
  
  return {
    total: totalWorkouts,
    completed,
    skipped,
    notDone: totalWorkouts - completed - skipped,
    completionRate: Math.round(completionRate),
    currentWeek: currentWeek || 1
  };
};

// Get schedule for a specific week
export const getScheduleForWeek = (week, runningData, cyclingData, weightData, workoutDays, activeLevel, yogaData, getOrCreateYogaEntry) => {
  const schedule = {
    'Sunday': [],
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': []
  };

  // Add runs
  if (Array.isArray(runningData)) {
    runningData.filter(r => r && r.week === week).forEach(run => {
      if (run && run.day && schedule[run.day]) {
        schedule[run.day].push({
          type: 'Running',
          detail: `Run ${run.run || ''}: ${run.distance || 0}km ${run.type || 'Steady'} (${run.intensity || ''})`,
          isInterval: run.type === 'Interval',
          status: run.status || 'not_done',
          identifier: { week: run.week, day: run.day, run: run.run }
        });
      }
    });
  }

  // Add weights
  workoutDays.forEach(workout => {
    // Get status from first exercise of this workout for this week
    const workoutStatus = weightData.find(w => 
      w.week === week && 
      w.day === workout.day && 
      w.workoutName === workout.name
    )?.status || 'not_done';
    
    schedule[workout.day].push({
      type: 'Weights',
      detail: workout.name,
      status: workoutStatus,
      identifier: { week, day: workout.day, workoutName: workout.name }
    });
  });

  // Add cycling
  if (activeLevel === 1) {
    const cycleType = [2, 4, 6, 8].includes(week) ? 'Interval' : 'Steady';
    const cyclingStatus = cyclingData.find(c => c.week === week && c.day === 'Friday')?.status || 'not_done';
    schedule['Friday'].push({
      type: 'Cycling',
      detail: `40min ${cycleType} Cycle`,
      status: cyclingStatus,
      identifier: { week, day: 'Friday' }
    });
  } else {
    // Level 2: Thursday cycling
    const cycleType = [2, 4, 6, 8, 10].includes(week) ? 'Interval' : 'Steady';
    const duration = cycleType === 'Interval' ? '40min' : '45-60min';
    const cyclingStatus = cyclingData.find(c => c.week === week && c.day === 'Thursday')?.status || 'not_done';
    schedule['Thursday'].push({
      type: 'Cycling',
      detail: `${duration} ${cycleType} Cycle`,
      status: cyclingStatus,
      identifier: { week, day: 'Thursday' }
    });
  }

  // Add yoga on rest days (days without running or cycling)
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  daysOfWeek.forEach(day => {
    // Check if day has running or cycling
    const hasRunning = schedule[day].some(a => a.type === 'Running');
    const hasCycling = schedule[day].some(a => a.type === 'Cycling');
    
    // If no running or cycling, add yoga
    if (!hasRunning && !hasCycling) {
      // Get or create yoga entry
      let yogaEntry;
      if (getOrCreateYogaEntry && yogaData) {
        yogaEntry = getOrCreateYogaEntry(week, day);
      } else {
        yogaEntry = yogaData?.find(y => y.week === week && y.day === day) || {
          week,
          day,
          duration: '',
          status: 'not_done'
        };
      }
      
      schedule[day].push({
        type: 'Yoga',
        detail: 'Yoga Session',
        status: yogaEntry.status || 'not_done',
        identifier: { week, day }
      });
    }
  });

  return schedule;
};

// Get last week's weight for an exercise
export const getLastWeekWeight = (currentWeek, day, exercise, setNum, weightData) => {
  if (currentWeek === 1) return '-';
  
  const lastWeekExercise = weightData.find(
    item => item.week === currentWeek - 1 && 
            item.day === day && 
            item.exercise === exercise
  );
  
  if (!lastWeekExercise || !lastWeekExercise.sets || lastWeekExercise.sets.length === 0) {
    return '-';
  }
  
  // Find the set with matching set number
  const lastSet = lastWeekExercise.sets.find(s => s.set === setNum);
  return lastSet?.weight || '-';
};

// Calculate current week from start date
export const calculateCurrentWeek = (startDate, maxWeeks) => {
  if (!startDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // If start date is in the future, return null (program hasn't started yet)
  if (today < start) return null;
  
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const week = Math.floor(daysDiff / 7) + 1;
  
  // Clamp to valid weeks (1 to maxWeeks)
  return Math.max(1, Math.min(week, maxWeeks));
};

// Get days into program
export const getDaysIntoProgram = (startDate) => {
  if (!startDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // If start date is in the future, return null (program hasn't started yet)
  if (today < start) return null;
  
  const daysDiff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysDiff);
};

// Get today's weekday name
export const getTodayWeekday = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

// Calculate the date for a workout given start date, week, and day
export const calculateWorkoutDate = (startDate, week, dayName) => {
  if (!startDate) return null;
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Calculate the date: start date + (week - 1) * 7 days + day offset
  const weekOffset = (week - 1) * 7;
  const dayIndex = weekdays.indexOf(dayName);
  const startDayIndex = start.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days to add: week offset + difference between target day and start day
  const daysToAdd = weekOffset + ((dayIndex - startDayIndex + 7) % 7);
  
  const workoutDate = new Date(start);
  workoutDate.setDate(start.getDate() + daysToAdd);
  
  return workoutDate;
};

// Get the next upcoming workout
export const getNextWorkout = (effectiveWeek, maxWeeks, runningData, cyclingData, weightData, workoutDays, activeLevel, todayWeekday, programHasStarted = true, yogaData, getOrCreateYogaEntry) => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = weekdays.indexOf(todayWeekday);
  
  // Check current week starting from today
  let currentWeek = effectiveWeek;
  // If program hasn't started, start from beginning of Week 1; otherwise start from tomorrow
  let startIndex = programHasStarted ? (todayIndex + 1) : 0;
  
  // First, check remaining days in current week
  for (let week = currentWeek; week <= maxWeeks; week++) {
    const schedule = getScheduleForWeek(week, runningData, cyclingData, weightData, workoutDays, activeLevel, yogaData, getOrCreateYogaEntry);
    
    // If checking current week and program has started, start from tomorrow; otherwise start from Sunday
    const startDayIndex = (week === currentWeek && programHasStarted) ? startIndex : 0;
    
    for (let i = startDayIndex; i < weekdays.length; i++) {
      const day = weekdays[i];
      const workouts = schedule[day] || [];
      
      if (workouts.length > 0) {
        // Return the first workout found
        return {
          workout: workouts[0],
          day: day,
          week: week
        };
      }
    }
    
    // Reset start index for future weeks
    startIndex = 0;
  }
  
  // No future workouts found
  return null;
};
