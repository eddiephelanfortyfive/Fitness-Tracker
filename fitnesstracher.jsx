import React, { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';

const HybridTrainingTracker = () => {
  const [activeSheet, setActiveSheet] = useState('schedule');
  const [activeWeek, setActiveWeek] = useState(1);
  
  // Helper function to get default running data
  const getDefaultRunningData = () => {
    const weeks = [];
    const runDays = ['Sunday', 'Tuesday', 'Thursday']; // Days for the 3 runs
    
    for (let week = 1; week <= 8; week++) {
      for (let run = 0; run < 3; run++) {
        let distance = week === 1 ? 3 : week <= 5 ? 3 + (week - 1) * 0.5 : 5;
        let type = 'Steady';
        let intensity = run === 1 ? '80-85% HR' : '65-75% HR';
        
        if (week >= 6 && run === 1) {
          type = 'Interval';
          intensity = 'Variable';
        }
        
        weeks.push({
          week,
          day: runDays[run],
          run: run + 1,
          type,
          intensity,
          distance,
          duration: '',
          pace: '',
          rpe: ''
        });
      }
    }
    return weeks;
  };

  // Helper function to get default cycling data
  const getDefaultCyclingData = () => {
    const weeks = [];
    const intervalWeeks = [2, 4, 6, 8];
    
    for (let week = 1; week <= 8; week++) {
      if (intervalWeeks.includes(week)) {
        weeks.push(
          { week, day: 'Friday', segment: 'Warm-up', duration: 10, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Hard 1', duration: 4, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Easy 1', duration: 2, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Hard 2', duration: 4, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Easy 2', duration: 2, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Hard 3', duration: 4, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Easy 3', duration: 2, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Hard 4', duration: 4, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Easy 4', duration: 2, distance: '', pace: '', rpe: '' },
          { week, day: 'Friday', segment: 'Cool-down', duration: 6, distance: '', pace: '', rpe: '' }
        );
      } else {
        weeks.push({
          week,
          day: 'Friday',
          segment: 'Steady Cycle',
          duration: 40,
          distance: '',
          pace: '',
          rpe: ''
        });
      }
    }
    return weeks;
  };

  // Running data structure with days - load from localStorage or use defaults
  const [runningData, setRunningData] = useState(() => {
    try {
      const saved = localStorage.getItem('fitnessTracker_runningData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading running data from localStorage:', e);
    }
    return getDefaultRunningData();
  });

  // Cycling data structure - load from localStorage or use defaults
  const [cyclingData, setCyclingData] = useState(() => {
    try {
      const saved = localStorage.getItem('fitnessTracker_cyclingData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading cycling data from localStorage:', e);
    }
    return getDefaultCyclingData();
  });

  // Weight training data structure
  const workoutDays = [
    {
      day: 'Monday',
      name: 'Chest & Triceps',
      exercises: [
        { name: 'Incline Dumbbell Press', repRange: '8-12', recommendedSets: 2 },
        { name: 'Flat Chest Press Machine', repRange: '8-12', recommendedSets: 2 },
        { name: 'Pec Dec Machine', repRange: '8-12', recommendedSets: 2 },
        { name: 'Cable/Dumbbell Flyes', repRange: '8-12', recommendedSets: 2 },
        { name: 'Rope Tricep Pulldowns', repRange: '10-14', recommendedSets: 2 },
        { name: 'Straight Bar Pushdowns', repRange: '10-14', recommendedSets: 2 },
        { name: 'Overhead Tricep Press', repRange: '10-14', recommendedSets: 2 }
      ]
    },
    {
      day: 'Tuesday',
      name: 'Back & Biceps',
      exercises: [
        { name: 'Lat Pulldown (Wide Grip)', repRange: '8-12', recommendedSets: 2 },
        { name: 'Seated Cable Row (Close Grip)', repRange: '8-12', recommendedSets: 2 },
        { name: 'T Bar Row', repRange: '8-12', recommendedSets: 2 },
        { name: 'Single Arm Cable Low Row', repRange: '8-12', recommendedSets: 2 },
        { name: 'Cable Hammer Curls', repRange: '10-14', recommendedSets: 2 },
        { name: 'Seated Dumbbell Bicep Curls', repRange: '10-14', recommendedSets: 2 },
        { name: 'Preacher Curls', repRange: '10-14', recommendedSets: 2 }
      ]
    },
    {
      day: 'Wednesday',
      name: 'Shoulders',
      exercises: [
        { name: 'Dumbbell Shoulder Press', repRange: '8-12', recommendedSets: 2 },
        { name: 'Machine Shoulder Press', repRange: '8-12', recommendedSets: 2 },
        { name: 'Dumbbell Side Lateral Raises', repRange: '10-14', recommendedSets: 3 },
        { name: 'Reverse Pec Dec Machine', repRange: '10-14', recommendedSets: 2 }
      ]
    },
    {
      day: 'Thursday',
      name: 'Legs',
      exercises: [
        { name: 'Hamstring Curl Machine', repRange: '8-12', recommendedSets: 2 },
        { name: 'RDLs', repRange: '8-12', recommendedSets: 2 },
        { name: 'Seated Leg Press', repRange: '8-12', recommendedSets: 2 },
        { name: 'Bulgarian Split Squats', repRange: '8-12', recommendedSets: 2 },
        { name: 'Leg Extensions', repRange: '8-12', recommendedSets: 2 }
      ]
    }
  ];

  // Helper function to get default weight data
  const getDefaultWeightData = () => {
    const allData = [];
    for (let week = 1; week <= 8; week++) {
      workoutDays.forEach(workout => {
        workout.exercises.forEach(exercise => {
          allData.push({
            week,
            day: workout.day,
            workoutName: workout.name,
            exercise: exercise.name,
            repRange: exercise.repRange,
            recommendedSets: exercise.recommendedSets,
            numSets: 0, // User will select this
            sets: [] // Array of sets that will grow dynamically
          });
        });
      });
    }
    return allData;
  };

  const [weightData, setWeightData] = useState(() => {
    try {
      const saved = localStorage.getItem('fitnessTracker_weightData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading weight data from localStorage:', e);
    }
    return getDefaultWeightData();
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('fitnessTracker_runningData', JSON.stringify(runningData));
    } catch (e) {
      console.error('Error saving running data to localStorage:', e);
    }
  }, [runningData]);

  useEffect(() => {
    try {
      localStorage.setItem('fitnessTracker_cyclingData', JSON.stringify(cyclingData));
    } catch (e) {
      console.error('Error saving cycling data to localStorage:', e);
    }
  }, [cyclingData]);

  useEffect(() => {
    try {
      localStorage.setItem('fitnessTracker_weightData', JSON.stringify(weightData));
    } catch (e) {
      console.error('Error saving weight data to localStorage:', e);
    }
  }, [weightData]);

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

  const updateWeight = (exerciseIndex, setIndex, field, value) => {
    const newData = [...weightData];
    if (newData[exerciseIndex].sets[setIndex]) {
      newData[exerciseIndex].sets[setIndex][field] = value;
      setWeightData(newData);
    }
  };

  const getLastWeekWeight = (currentWeek, day, exercise, setNum) => {
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

  const exportToCSV = () => {
    let csv = '';
    
    if (activeSheet === 'running') {
      csv = 'Week,Day,Run,Type,Intensity,Distance (km),Duration (min),Pace (km/h),RPE (1-5)\n';
      runningData.filter(r => r.week === activeWeek).forEach(row => {
        csv += `${row.week},${row.day},${row.run},${row.type},${row.intensity},${row.distance},${row.duration},${row.pace},${row.rpe}\n`;
      });
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
            const lastWeek = getLastWeekWeight(exercise.week, exercise.day, exercise.exercise, set.set);
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

  const getScheduleForWeek = (week) => {
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
    runningData.filter(r => r.week === week).forEach(run => {
      schedule[run.day].push({
        type: 'Running',
        detail: `Run ${run.run}: ${run.distance}km ${run.type} (${run.intensity})`
      });
    });

    // Add weights
    workoutDays.forEach(workout => {
      schedule[workout.day].push({
        type: 'Weights',
        detail: workout.name
      });
    });

    // Add cycling
    const cycleType = [2, 4, 6, 8].includes(week) ? 'Interval' : 'Steady';
    schedule['Friday'].push({
      type: 'Cycling',
      detail: `40min ${cycleType} Cycle`
    });

    return schedule;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Level 1 Hybrid Training Tracker</h1>
          <p className="text-slate-400">Track your 8-week journey to hybrid fitness</p>
        </div>

        {/* Sheet Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveSheet('schedule')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSheet === 'schedule'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Calendar className="inline mr-2" size={20} />
            Schedule
          </button>
          <button
            onClick={() => setActiveSheet('running')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSheet === 'running'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Running
          </button>
          <button
            onClick={() => setActiveSheet('cycling')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSheet === 'cycling'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Cycling
          </button>
          <button
            onClick={() => setActiveSheet('weights')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeSheet === 'weights'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Weight Training
          </button>
          {activeSheet !== 'schedule' && (
            <button
              onClick={exportToCSV}
              className="ml-auto px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Download size={20} />
              Export Week {activeWeek}
            </button>
          )}
        </div>

        {/* Week Selector (for non-schedule sheets) */}
        {activeSheet !== 'schedule' && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {[...Array(8)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setActiveWeek(i + 1)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeWeek === i + 1
                    ? 'bg-slate-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-650'
                }`}
              >
                Week {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Schedule View */}
        {activeSheet === 'schedule' && (
          <div className="space-y-6">
            {[...Array(8)].map((_, weekIndex) => {
              const week = weekIndex + 1;
              const schedule = getScheduleForWeek(week);
              
              return (
                <div key={week} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
                  <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Week {week}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-slate-700">
                    {Object.entries(schedule).map(([day, activities]) => (
                      <div key={day} className="p-4">
                        <h3 className="font-bold text-white mb-3 text-center">{day}</h3>
                        <div className="space-y-2">
                          {activities.length > 0 ? (
                            activities.map((activity, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded text-xs ${
                                  activity.type === 'Running'
                                    ? 'bg-blue-900 text-blue-200'
                                    : activity.type === 'Weights'
                                    ? 'bg-purple-900 text-purple-200'
                                    : 'bg-green-900 text-green-200'
                                }`}
                              >
                                <div className="font-semibold">{activity.type}</div>
                                <div className="text-xs opacity-90">{activity.detail}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-500 text-xs text-center italic">Rest Day</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Running Sheet */}
        {activeSheet === 'running' && (
          <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Running - Week {activeWeek}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Run #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Intensity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Distance (km)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration (min)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Pace (km/h)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {runningData.filter(r => r.week === activeWeek).map((row, index) => {
                    const dataIndex = runningData.findIndex(
                      item => item.week === row.week && item.run === row.run
                    );
                    
                    return (
                      <tr key={index} className="hover:bg-slate-700 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{row.day}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.run}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            row.type === 'Interval' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{row.intensity}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.distance}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.1"
                            value={row.duration}
                            onChange={(e) => updateRunning(dataIndex, 'duration', e.target.value)}
                            className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {row.pace && `${row.pace} km/h`}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={row.rpe}
                            onChange={(e) => updateRunning(dataIndex, 'rpe', e.target.value)}
                            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cycling Sheet */}
        {activeSheet === 'cycling' && (
          <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">Cycling - Week {activeWeek}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Segment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Duration (min)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Distance (km)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Pace (km/h)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {cyclingData.filter(r => r.week === activeWeek).map((row, index) => {
                    const dataIndex = cyclingData.findIndex(
                      item => item.week === row.week && item.segment === row.segment
                    );
                    
                    return (
                      <tr key={index} className="hover:bg-slate-700 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-white">{row.day}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.segment}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{row.duration}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.1"
                            value={row.distance}
                            onChange={(e) => updateCycling(dataIndex, 'distance', e.target.value)}
                            className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {row.pace && `${row.pace} km/h`}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={row.rpe}
                            onChange={(e) => updateCycling(dataIndex, 'rpe', e.target.value)}
                            className="w-20 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weight Training Sheet */}
        {activeSheet === 'weights' && (
          <div className="space-y-6">
            {workoutDays.map((workout, dayIndex) => {
              const dayExercises = weightData.filter(
                item => item.week === activeWeek && item.day === workout.day
              );
              
              return (
                <div key={dayIndex} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
                  <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
                    <h3 className="text-xl font-semibold text-white">{workout.day} - {workout.name}</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {dayExercises.map((exercise, exerciseIndex) => {
                      const exerciseDataIndex = weightData.findIndex(
                        item => item.week === exercise.week && 
                                item.day === exercise.day && 
                                item.exercise === exercise.exercise
                      );
                      
                      return (
                        <div key={exerciseIndex} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-white mb-1">{exercise.exercise}</h4>
                              <p className="text-sm text-slate-400">Rep Range: {exercise.repRange}</p>
                              {exercise.recommendedSets && (
                                <p className="text-xs text-slate-500 mt-1 italic">
                                  Recommended: {exercise.recommendedSets} set{exercise.recommendedSets !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-slate-300">Sets:</label>
                              <select
                                value={exercise.numSets || 0}
                                onChange={(e) => updateNumSets(exerciseDataIndex, e.target.value)}
                                className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="0">Select...</option>
                                {[...Array(5)].map((_, i) => (
                                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {exercise.sets && exercise.sets.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-slate-800">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Set</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Last Week</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Weight (kg)</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Reps</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">RPE (1-10)</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-64">Notes</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-600">
                                  {exercise.sets.map((set, setIndex) => {
                                    const lastWeekWeight = getLastWeekWeight(activeWeek, workout.day, exercise.exercise, set.set);
                                    
                                    return (
                                      <tr key={setIndex} className="hover:bg-slate-600 transition-colors">
                                        <td className="px-4 py-3 text-sm text-white font-medium">{set.set}</td>
                                        <td className="px-4 py-3 text-sm text-blue-400 font-medium">
                                          {lastWeekWeight !== '-' ? `${lastWeekWeight} kg` : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                          <input
                                            type="number"
                                            step="0.5"
                                            value={set.weight}
                                            onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'weight', e.target.value)}
                                            className="w-20 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0"
                                          />
                                        </td>
                                        <td className="px-4 py-3">
                                          <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'reps', e.target.value)}
                                            className="w-16 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="0"
                                          />
                                        </td>
                                        <td className="px-4 py-3">
                                          <select
                                            value={set.rpe}
                                            onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'rpe', e.target.value)}
                                            className="w-20 px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                          >
                                            <option value="">-</option>
                                            {[...Array(10)].map((_, i) => (
                                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td className="px-4 py-3">
                                          <input
                                            type="text"
                                            value={set.notes}
                                            onChange={(e) => updateWeight(exerciseDataIndex, setIndex, 'notes', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-800 border border-slate-500 rounded text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Form notes, feeling, etc."
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridTrainingTracker;