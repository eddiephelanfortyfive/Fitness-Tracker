// Default data generators for Level 1 and Level 2 training plans

// Helper function to get default running data for Level 1
export const getDefaultRunningDataLevel1 = () => {
  const weeks = [];
  // Level 1: Monday 3KM, Wednesday 3KM, Saturday 5KM (per PDF)
  // Weeks 2-5: Increase Monday and Wednesday runs by 0.5KM per week until they hit 5KM
  // Week 6-8: Wednesday becomes interval run
  
  for (let week = 1; week <= 8; week++) {
    // Calculate distances
    let mondayDistance = week === 1 ? 3 : week <= 5 ? 3 + (week - 1) * 0.5 : 5;
    let wednesdayDistance = week === 1 ? 3 : week <= 5 ? 3 + (week - 1) * 0.5 : 5;
    let saturdayDistance = 5; // Always 5KM
    
    // Run 1: Monday (3KM progressing to 5KM)
    weeks.push({
      week,
      day: 'Monday',
      run: 1,
      type: 'Steady',
      intensity: '65-75% HR',
      distance: mondayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure: '',
      intervalRounds: 0,
      restTime: '',
      status: 'not_done'
    });
    
    // Run 2: Wednesday (3KM progressing to 5KM, becomes interval in weeks 6-8)
    let wednesdayType = 'Steady';
    let wednesdayIntensity = '80-85% HR';
    let intervalStructure = '';
    let intervalRounds = 0;
    let restTime = '';
    
    if (week >= 6) {
      wednesdayType = 'Interval';
      wednesdayIntensity = 'Variable';
      // Level 1: 5KM split into exactly as per PDF
      intervalStructure = '1KM Easy @ 60% HR → 500m Hard @ 85% HR → 1KM Easy @ 60% HR → 1KM Hard @ 85% HR → 1KM Easy @ 60% HR → 500m Hard @ 85% HR';
      intervalRounds = 1; // Single sequence (total 5KM)
      restTime = 'Active recovery (easy pace segments @ 60% HR)';
    }
    
    weeks.push({
      week,
      day: 'Wednesday',
      run: 2,
      type: wednesdayType,
      intensity: wednesdayIntensity,
      distance: wednesdayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure,
      intervalRounds,
      restTime,
      status: 'not_done'
    });
    
    // Run 3: Saturday (always 5KM)
    weeks.push({
      week,
      day: 'Saturday',
      run: 3,
      type: 'Steady',
      intensity: '65-75% HR',
      distance: saturdayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure: '',
      intervalRounds: 0,
      restTime: '',
      status: 'not_done'
    });
  }
  return weeks;
};

// Helper function to get default running data for Level 2
export const getDefaultRunningDataLevel2 = () => {
  const weeks = [];
  // Level 2: Monday 5KM, Wednesday 5KM, Saturday 8KM
  // Weeks 2-6: Increase 8KM and one 5KM by 0.5KM per week
  for (let week = 1; week <= 10; week++) {
    let mondayDistance = 5;
    let wednesdayDistance = 5;
    let saturdayDistance = 8;
    
    // Weeks 2-6: progression
    if (week >= 2 && week <= 6) {
      const progression = (week - 1) * 0.5;
      mondayDistance = 5 + progression;
      saturdayDistance = 8 + progression;
    }
    
    // Week 1 runs
    weeks.push({
      week,
      day: 'Monday',
      run: 1,
      type: 'Steady',
      intensity: week >= 6 ? '65-75% HR' : '65-75% HR',
      distance: mondayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure: '',
      intervalRounds: 0,
      restTime: '',
      status: 'not_done'
    });
    
    let intervalStructure = '';
    let intervalRounds = 0;
    let restTime = '';
    
    if (week >= 6) {
      // Level 2: 1KM Easy @ 60%, 1KM Hard @ 85%, repeat 4 times (total 8KM)
      intervalStructure = '1KM Easy @ 60% HR → 1KM Hard @ 85% HR';
      intervalRounds = 4;
      restTime = 'Active recovery (easy pace segments @ 60% HR)';
    }
    
    weeks.push({
      week,
      day: 'Wednesday',
      run: 2,
      type: week >= 6 ? 'Interval' : 'Steady',
      intensity: week >= 6 ? 'Variable' : '80-85% HR',
      distance: wednesdayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure,
      intervalRounds,
      restTime,
      status: 'not_done'
    });
    
    weeks.push({
      week,
      day: 'Saturday',
      run: 3,
      type: 'Steady',
      intensity: '65-75% HR',
      distance: saturdayDistance,
      duration: '',
      pace: '',
      rpe: '',
      intervalStructure: '',
      intervalRounds: 0,
      restTime: '',
      status: 'not_done'
    });
  }
  return weeks;
};

// Helper function to get default cycling data for Level 1
export const getDefaultCyclingDataLevel1 = () => {
  const weeks = [];
  const intervalWeeks = [2, 4, 6, 8];
  
  for (let week = 1; week <= 8; week++) {
    if (intervalWeeks.includes(week)) {
      weeks.push(
        { week, day: 'Friday', segment: 'Warm-up', duration: 10, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Hard 1', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Easy 1', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Hard 2', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Easy 2', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Hard 3', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Easy 3', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Hard 4', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Easy 4', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Friday', segment: 'Cool-down', duration: 6, distance: '', pace: '', rpe: '', status: 'not_done' }
      );
    } else {
      weeks.push({
        week,
        day: 'Friday',
        segment: 'Steady Cycle',
        duration: 40,
        distance: '',
        pace: '',
        rpe: '',
        status: 'not_done'
      });
    }
  }
  return weeks;
};

// Helper function to get default cycling data for Level 2
export const getDefaultCyclingDataLevel2 = () => {
  const weeks = [];
  const intervalWeeks = [2, 4, 6, 8, 10];
  
  for (let week = 1; week <= 10; week++) {
    if (intervalWeeks.includes(week)) {
      weeks.push(
        { week, day: 'Thursday', segment: 'Warm-up', duration: 10, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Hard 1', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Easy 1', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Hard 2', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Easy 2', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Hard 3', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Easy 3', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Hard 4', duration: 4, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Easy 4', duration: 2, distance: '', pace: '', rpe: '', status: 'not_done' },
        { week, day: 'Thursday', segment: 'Cool-down', duration: 6, distance: '', pace: '', rpe: '', status: 'not_done' }
      );
    } else {
      weeks.push({
        week,
        day: 'Thursday',
        segment: 'Steady Cycle',
        duration: 60, // 45-60 min for Level 2
        distance: '',
        pace: '',
        rpe: '',
        status: 'not_done'
      });
    }
  }
  return weeks;
};

// Helper function to get default weight data for Level 1
export const getDefaultWeightDataLevel1 = (workoutDaysLevel1) => {
  const allData = [];
  for (let week = 1; week <= 8; week++) {
    workoutDaysLevel1.forEach(workout => {
      workout.exercises.forEach(exercise => {
        allData.push({
          week,
          day: workout.day,
          workoutName: workout.name,
          exercise: exercise.name,
          repRange: exercise.repRange,
          recommendedSets: exercise.recommendedSets,
          numSets: 0, // User will select this
          sets: [], // Array of sets that will grow dynamically
          status: 'not_done',
          weightRecommendation: null // 'drop', 'stay', 'increase', or null
        });
      });
    });
  }
  return allData;
};

// Helper function to get default weight data for Level 2
export const getDefaultWeightDataLevel2 = (workoutDaysLevel2) => {
  const allData = [];
  for (let week = 1; week <= 10; week++) {
    workoutDaysLevel2.forEach(workout => {
      workout.exercises.forEach(exercise => {
        allData.push({
          week,
          day: workout.day,
          workoutName: workout.name,
          exercise: exercise.name,
          repRange: exercise.repRange,
          recommendedSets: exercise.recommendedSets,
          numSets: 0, // User will select this
          sets: [], // Array of sets that will grow dynamically
          status: 'not_done',
          weightRecommendation: null // 'drop', 'stay', 'increase', or null
        });
      });
    });
  }
  return allData;
};

