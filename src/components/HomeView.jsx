import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, Clock, Check, X, Settings, ArrowRight } from 'lucide-react';
import { calculateWeekProgress, calculateOverallProgress } from '../utils/calculations';
import { useDebounce } from '../hooks/useDebounce';
import { decimalToMMSS, mmssToDecimal, formatMMSS, validateMMSS, calculatePaceMinPerKm } from '../utils/timeFormat';
import { convertHRPercentageToBPM } from '../utils/heartRate';

const HomeView = ({
  maxWeeks,
  runningData,
  cyclingData,
  weightData,
  yogaData,
  coldExposureData,
  workoutDays,
  activeLevel,
  updateWorkoutStatus,
  updateRunning,
  updateCycling,
  updateYoga,
  getOrCreateYogaEntry,
  todaysWorkouts,
  nextWorkout,
  effectiveWeek,
  daysIntoProgram,
  startDate,
  isCollapsed,
  toggleCollapsed,
  getWorkoutIdentifier,
  setActiveSheet,
  setActiveWeek,
  setShowSettings,
  calculateWorkoutDate,
  maxHeartRate
}) => {
  const weekProgress = calculateWeekProgress(effectiveWeek, runningData, cyclingData, weightData, yogaData);
  const overallProgress = calculateOverallProgress(runningData, cyclingData, weightData, yogaData);

  const getActivityType = (type) => {
    if (type === 'Running') return 'running';
    if (type === 'Cycling') return 'cycling';
    if (type === 'Weights') return 'weights';
    if (type === 'Yoga') return 'yoga';
    return 'running';
  };

  // Get exercise count for weights workout
  const getExerciseCount = (day, workoutName) => {
    const workout = workoutDays.find(w => w.day === day && w.name === workoutName);
    return workout ? workout.exercises.length : 0;
  };

  // Find data index for running/cycling/yoga workouts
  const findDataIndex = (type, identifier) => {
    if (type === 'running') {
      return runningData.findIndex(r => 
        r.week === identifier.week && 
        r.day === identifier.day && 
        r.run === identifier.run
      );
    } else if (type === 'cycling') {
      // For cycling, find the first segment (all segments share the same status)
      return cyclingData.findIndex(c => 
        c.week === identifier.week && 
        c.day === identifier.day
      );
    } else if (type === 'yoga') {
      return yogaData?.findIndex(y => 
        y.week === identifier.week && 
        y.day === identifier.day
      ) ?? -1;
    }
    return -1;
  };

  // Get cycling workout data (aggregate from all segments)
  const getCyclingWorkoutData = (identifier) => {
    const segments = cyclingData.filter(c => 
      c.week === identifier.week && 
      c.day === identifier.day
    );
    if (segments.length === 0) return null;
    
    // Sum distance from all segments
    const totalDistance = segments.reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0);
    // Get RPE from first segment (they should all be the same)
    const rpe = segments[0]?.rpe || '';
    
    return {
      distance: totalDistance > 0 ? totalDistance.toFixed(1) : '',
      rpe: rpe,
      status: segments[0]?.status || 'not_done'
    };
  };

  // Get recent activity (last 5 completed workouts)
  const getRecentActivity = () => {
    const allWorkouts = [];
    
    // Add running workouts
    runningData.forEach(r => {
      if (r.status === 'completed' || r.status === 'skipped') {
        allWorkouts.push({
          type: 'Running',
          detail: `${r.day} - Run ${r.run}: ${r.distance}km`,
          status: r.status,
          week: r.week,
          day: r.day,
          date: null
        });
      }
    });

    // Add cycling workouts
    const cyclingDays = [...new Set(cyclingData.map(c => `${c.week}-${c.day}`))];
    cyclingDays.forEach(key => {
      const [week, day] = key.split('-');
      const workout = cyclingData.find(c => c.week === parseInt(week) && c.day === day);
      if (workout && (workout.status === 'completed' || workout.status === 'skipped')) {
        allWorkouts.push({
          type: 'Cycling',
          detail: `${day} - Cycling`,
          status: workout.status,
          week: parseInt(week),
          day: day,
          date: null
        });
      }
    });

    // Add weight workouts
    const weightWorkoutKeys = [...new Set(weightData.map(w => `${w.week}-${w.day}-${w.workoutName}`))];
    weightWorkoutKeys.forEach(key => {
      const [week, day, workoutName] = key.split('-');
      const workout = weightData.find(w => 
        w.week === parseInt(week) && 
        w.day === day && 
        w.workoutName === workoutName
      );
      if (workout && (workout.status === 'completed' || workout.status === 'skipped')) {
        allWorkouts.push({
          type: 'Weights',
          detail: `${day} - ${workoutName}`,
          status: workout.status,
          week: parseInt(week),
          day: day,
          date: null
        });
      }
    });

    // Add cold exposure entries
    if (coldExposureData && coldExposureData.length > 0) {
      const methodLabels = {
        shower: 'Shower',
        ice_bath: 'Ice Bath',
        sea_river_swim: 'Sea/River Swim'
      };
      coldExposureData.forEach(entry => {
        if (entry.duration) {
          allWorkouts.push({
            type: 'Cold Exposure',
            detail: `${methodLabels[entry.method] || entry.method}: ${entry.duration}`,
            status: 'completed',
            week: null,
            day: null,
            date: entry.date
          });
        }
      });
    }

    // Sort by date/week (descending) and return last 5
    return allWorkouts
      .sort((a, b) => {
        // If both have dates, sort by date
        if (a.date && b.date) {
          return new Date(b.date) - new Date(a.date);
        }
        // If one has date and one has week, prioritize date
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        // Both have weeks, sort by week then day
        if (a.week && b.week) {
          return b.week - a.week || (b.day > a.day ? 1 : -1);
        }
        return 0;
      })
      .slice(0, 5);
  };

  const recentActivity = getRecentActivity();

  // WorkoutCard component with quick entry
  const WorkoutCard = ({ workout, idx }) => {
    const workoutId = getWorkoutIdentifier(
      getActivityType(workout.type),
      workout.identifier
    );
    const collapsed = isCollapsed(workoutId);
    const shouldShowCollapsed = (workout.status === 'completed' || workout.status === 'skipped') && collapsed;
    const activityType = getActivityType(workout.type);
    
    // Get workout data for quick entry
    const dataIndex = findDataIndex(activityType, workout.identifier);
    let workoutData = null;
    if (activityType === 'running' && dataIndex >= 0) {
      workoutData = runningData[dataIndex];
    } else if (activityType === 'cycling') {
      workoutData = getCyclingWorkoutData(workout.identifier);
    } else if (activityType === 'yoga') {
      if (dataIndex >= 0) {
        workoutData = yogaData[dataIndex];
      } else {
        // Create entry if it doesn't exist
        workoutData = getOrCreateYogaEntry(workout.identifier.week, workout.identifier.day);
      }
    }

    // Local state for quick entry (for immediate UI updates)
    // Convert decimal duration to MM:SS for display
    const initialDuration = workoutData?.duration 
      ? (typeof workoutData.duration === 'string' && workoutData.duration.includes(':') 
          ? workoutData.duration 
          : decimalToMMSS(workoutData.duration))
      : '';
    const [localDuration, setLocalDuration] = useState(initialDuration);
    const [localDistance, setLocalDistance] = useState(workoutData?.distance || '');
    const [localRpe, setLocalRpe] = useState(workoutData?.rpe || '');
    const [saveStatus, setSaveStatus] = useState('');

    // Debounce values for auto-save
    const debouncedDuration = useDebounce(localDuration, 1500);
    const debouncedDistance = useDebounce(localDistance, 1500);
    const debouncedRpe = useDebounce(localRpe, 1500);

    // Auto-save when debounced values change
    useEffect(() => {
      if (activityType === 'running' && dataIndex >= 0 && workoutData) {
        // Convert MM:SS to decimal for comparison
        const currentDuration = workoutData.duration 
          ? (typeof workoutData.duration === 'string' && workoutData.duration.includes(':')
              ? workoutData.duration
              : decimalToMMSS(workoutData.duration))
          : '';
        if (debouncedDuration !== currentDuration && debouncedDuration !== '') {
          updateRunning(dataIndex, 'duration', debouncedDuration);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } else if (activityType === 'yoga') {
        const currentDuration = workoutData?.duration || '';
        if (debouncedDuration !== currentDuration && debouncedDuration !== '') {
          const yogaIndex = findDataIndex('yoga', workout.identifier);
          if (yogaIndex >= 0) {
            updateYoga(yogaIndex, 'duration', debouncedDuration);
          } else {
            // Create entry if it doesn't exist
            const entry = getOrCreateYogaEntry(workout.identifier.week, workout.identifier.day);
            const newIndex = yogaData?.findIndex(y => y.week === entry.week && y.day === entry.day) ?? -1;
            if (newIndex >= 0) {
              updateYoga(newIndex, 'duration', debouncedDuration);
            }
          }
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
    }, [debouncedDuration, dataIndex, workoutData, activityType, updateRunning, updateYoga, yogaData, getOrCreateYogaEntry, workout]);

    useEffect(() => {
      if (workoutData && debouncedDistance !== '' && debouncedDistance !== workoutData.distance) {
        if (activityType === 'running' && dataIndex >= 0) {
          updateRunning(dataIndex, 'distance', debouncedDistance);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        } else if (activityType === 'cycling') {
          // For cycling, update distance proportionally across segments
          const segments = cyclingData.filter(c => 
            c.week === workout.identifier.week && 
            c.day === workout.identifier.day
          );
          const totalCurrentDistance = segments.reduce((sum, s) => sum + (parseFloat(s.distance) || 0), 0);
          const newDistance = parseFloat(debouncedDistance);
          
          if (totalCurrentDistance > 0 && segments.length > 0) {
            // Distribute new distance proportionally
            segments.forEach((segment) => {
              const segmentDistance = parseFloat(segment.distance) || 0;
              const proportion = segmentDistance / totalCurrentDistance;
              const newSegmentDistance = (newDistance * proportion).toFixed(1);
              const segmentIndex = cyclingData.findIndex(c => 
                c.week === segment.week && 
                c.day === segment.day && 
                c.segment === segment.segment
              );
              if (segmentIndex >= 0) {
                updateCycling(segmentIndex, 'distance', newSegmentDistance);
              }
            });
          } else if (segments.length > 0) {
            // If no current distance, distribute evenly
            const perSegment = (newDistance / segments.length).toFixed(1);
            segments.forEach((segment) => {
              const segmentIndex = cyclingData.findIndex(c => 
                c.week === segment.week && 
                c.day === segment.day && 
                c.segment === segment.segment
              );
              if (segmentIndex >= 0) {
                updateCycling(segmentIndex, 'distance', perSegment);
              }
            });
          }
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedDistance]);

    useEffect(() => {
      if (workoutData && debouncedRpe !== '' && debouncedRpe !== workoutData.rpe) {
        if (activityType === 'running' && dataIndex >= 0) {
          updateRunning(dataIndex, 'rpe', debouncedRpe);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        } else if (activityType === 'cycling') {
          // Update RPE for all segments
          const segments = cyclingData.filter(c => 
            c.week === workout.identifier.week && 
            c.day === workout.identifier.day
          );
          segments.forEach((segment) => {
            const segmentIndex = cyclingData.findIndex(c => 
              c.week === segment.week && 
              c.day === segment.day && 
              c.segment === segment.segment
            );
            if (segmentIndex >= 0) {
              updateCycling(segmentIndex, 'rpe', debouncedRpe);
            }
          });
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedRpe]);

    // Calculate pace (for running only, cycling doesn't have duration)
    // Calculate pace in min/km
    const calculatePace = () => {
      if (localDuration && localDistance) {
        const durationDecimal = mmssToDecimal(localDuration);
        const distanceNum = parseFloat(localDistance);
        if (durationDecimal && distanceNum > 0) {
          return calculatePaceMinPerKm(durationDecimal, distanceNum);
        }
      }
      // If we have stored pace, return it (already in min/km format after migration)
      return workoutData?.pace || '';
    };

    const pace = calculatePace();

    // Update local state when workoutData changes
    useEffect(() => {
      if (workoutData) {
        // Convert decimal duration to MM:SS for display
        const durationDisplay = workoutData.duration 
          ? (typeof workoutData.duration === 'string' && workoutData.duration.includes(':')
              ? workoutData.duration
              : decimalToMMSS(workoutData.duration))
          : '';
        setLocalDuration(durationDisplay);
        setLocalDistance(workoutData.distance || '');
        setLocalRpe(workoutData.rpe || '');
      }
    }, [workoutData]);

    if (shouldShowCollapsed) {
      return (
        <div
          className={`p-4 rounded-lg border-2 transition-all ${
            workout.status === 'completed'
              ? 'bg-green-900/30 border-green-600'
              : 'bg-red-900/30 border-red-600'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{workout.type}</span>
                {workout.status === 'completed' ? (
                  <Check size={16} className="text-green-400 flex-shrink-0" />
                ) : (
                  <X size={16} className="text-red-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-400 italic">Click to expand</p>
            </div>
            <button
              onClick={() => toggleCollapsed(workoutId)}
              className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition-all"
            >
              Expand
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
            className={`p-4 rounded-lg border-2 transition-all ${
            workout.status === 'completed'
              ? 'bg-green-900/30 border-green-600'
              : workout.status === 'skipped'
              ? 'bg-red-900/30 border-red-600'
              : workout.isInterval
              ? 'bg-orange-900/30 border-orange-600'
              : workout.type === 'Running'
              ? 'bg-blue-900/30 border-blue-600'
              : workout.type === 'Cycling'
              ? 'bg-green-900/30 border-green-600'
              : workout.type === 'Yoga'
              ? 'bg-indigo-900/30 border-indigo-600'
              : 'bg-purple-900/30 border-purple-600'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{workout.type}</span>
              {workout.status === 'completed' && (
                <Check size={16} className="text-green-400 flex-shrink-0" />
              )}
              {workout.status === 'skipped' && (
                <X size={16} className="text-red-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-300 break-words">{convertHRPercentageToBPM(workout.detail, maxHeartRate)}</p>
            {workout.type === 'Weights' && (
              <p className="text-xs text-slate-400 mt-1">
                {getExerciseCount(workout.identifier.day, workout.identifier.workoutName)} exercises
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveStatus === 'saved' && (
              <span className="text-xs text-green-400">Saved</span>
            )}
            <button
              onClick={() => updateWorkoutStatus(
                activityType,
                workout.identifier,
                workout.status
              )}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                workout.status === 'completed'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : workout.status === 'skipped'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {workout.status === 'completed' ? 'Completed' : 
               workout.status === 'skipped' ? 'Skipped' : 'Mark Done'}
            </button>
          </div>
        </div>

        {/* Quick Entry Fields for Running/Cycling/Yoga */}
        {workout.status !== 'completed' && workout.status !== 'skipped' && 
         (workout.type === 'Running' || workout.type === 'Cycling' || workout.type === 'Yoga') && workoutData && (
          <div className="mt-4 pt-4 border-t border-slate-600/50">
            <div className={`grid gap-3 ${
              workout.type === 'Running' ? 'grid-cols-2 sm:grid-cols-4' : 
              workout.type === 'Yoga' ? 'grid-cols-1 sm:grid-cols-2' :
              'grid-cols-2 sm:grid-cols-3'
            }`}>
              {/* Duration (Running and Yoga) */}
              {(workout.type === 'Running' || workout.type === 'Yoga') && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Duration (MM:SS)</label>
                  <input
                    type="text"
                    value={localDuration}
                    onChange={(e) => {
                      const formatted = formatMMSS(e.target.value);
                      setLocalDuration(formatted);
                    }}
                    onBlur={(e) => {
                      // Ensure proper format on blur
                      if (e.target.value && !e.target.value.includes(':')) {
                        const num = parseInt(e.target.value, 10);
                        if (!isNaN(num)) {
                          setLocalDuration(`${num}:00`);
                        }
                      } else if (e.target.value && validateMMSS(e.target.value)) {
                        // Already formatted correctly
                      } else if (e.target.value) {
                        // Invalid format, try to fix
                        const formatted = formatMMSS(e.target.value);
                        setLocalDuration(formatted || '');
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="25:30"
                    pattern="\d{1,3}:\d{2}"
                  />
                </div>
              )}

              {/* Distance (Running and Cycling only) */}
              {workout.type !== 'Yoga' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localDistance}
                    onChange={(e) => setLocalDistance(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              )}

              {/* Pace (calculated, Running only) */}
              {workout.type === 'Running' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Pace (min/km)</label>
                  <div className="px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-slate-300">
                    {pace ? `${pace}/km` : '-'}
                  </div>
                </div>
              )}

              {/* RPE (Running and Cycling only) */}
              {workout.type !== 'Yoga' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">RPE (1-5)</label>
                  <select
                    value={localRpe}
                    onChange={(e) => setLocalRpe(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <div className="mt-3">
              <button
                onClick={() => setActiveSheet(activityType)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <span>View Details</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Log Workout Button for Weights */}
        {workout.type === 'Weights' && workout.status !== 'completed' && workout.status !== 'skipped' && (
          <div className="mt-3 pt-3 border-t border-slate-600/50">
            <button
              onClick={() => setActiveSheet('weights')}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Log Workout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* View Details Button for completed/skipped workouts */}
        {(workout.status === 'completed' || workout.status === 'skipped') && (
          <div className="mt-3 pt-3 border-t border-slate-600/50">
            <button
              onClick={() => setActiveSheet(activityType)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <span>View Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header Card */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {startDate ? (
                (() => {
                  const programHasStarted = new Date() >= new Date(startDate);
                  return programHasStarted 
                    ? `Week ${effectiveWeek} of ${maxWeeks}` 
                    : 'Hybrid Training Tracker';
                })()
              ) : 'Hybrid Training Tracker'}
            </h1>
            {startDate && (() => {
              const programHasStarted = new Date() >= new Date(startDate);
              if (!programHasStarted) {
                return (
                  <p className="text-slate-400">
                    Your program starts on {new Date(startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                );
              } else if (daysIntoProgram !== null) {
                return (
                  <p className="text-slate-400">
                    Day {daysIntoProgram + 1} of your {maxWeeks * 7}-day program
                  </p>
                );
              }
              return null;
            })()}
            {!startDate && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <p className="text-slate-400">Set your program start date in</p>
                <button 
                  onClick={() => setShowSettings && setShowSettings(true)}
                  className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                >
                  <Settings size={16} />
                  Settings
                </button>
                <p className="text-slate-400">to see today's workout</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Workout Card */}
      <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar size={24} className="text-white" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Workouts</h2>
          </div>
          <p className="text-orange-100 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {todaysWorkouts.length > 0 ? (
            <div className="space-y-3">
              {todaysWorkouts.map((workout, idx) => (
                <WorkoutCard key={idx} workout={workout} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-slate-300 text-lg font-semibold">No workouts today</p>
                <p className="text-sm text-slate-500 mt-1">Enjoy your rest day</p>
              </div>
              
              {nextWorkout && (
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-1">Next Workout</h3>
                      <p className="text-lg font-bold text-white">
                        {nextWorkout.workout.type}
                      </p>
                      <p className="text-sm text-slate-300 mt-1">
                        {nextWorkout.day} - Week {nextWorkout.week}
                      </p>
                      {startDate && calculateWorkoutDate && (() => {
                        const workoutDate = calculateWorkoutDate(startDate, nextWorkout.week, nextWorkout.day);
                        return workoutDate ? (
                          <p className="text-xs text-slate-400 mt-1">
                            {workoutDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        ) : null;
                      })()}
                      <p className="text-xs text-slate-400 mt-1">
                        {convertHRPercentageToBPM(nextWorkout.workout.detail, maxHeartRate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {nextWorkout.workout.status === 'completed' && (
                        <Check size={20} className="text-green-400" />
                      )}
                      {nextWorkout.workout.status === 'skipped' && (
                        <X size={20} className="text-red-400" />
                      )}
                      {nextWorkout.workout.isInterval && (
                        <span className="px-2 py-1 text-xs font-semibold bg-orange-600 text-white rounded">
                          Interval
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveWeek(nextWorkout.week);
                      setActiveSheet(getActivityType(nextWorkout.workout.type));
                    }}
                    className="w-full mt-3 px-4 py-2 bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-500 transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Details</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} className="text-orange-400" />
            <span className="text-xs text-slate-400">Week Progress</span>
          </div>
          <div className="text-2xl font-bold text-white">{weekProgress.completionRate}%</div>
          <div className="text-xs text-slate-400">
            {weekProgress.completed}/{weekProgress.total} workouts
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-green-400" />
            <span className="text-xs text-slate-400">Overall</span>
          </div>
          <div className="text-2xl font-bold text-white">{overallProgress.completionRate}%</div>
          <div className="text-xs text-slate-400">
            Week {overallProgress.currentWeek}/{maxWeeks}
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Check size={20} className="text-green-400" />
            <span className="text-xs text-slate-400">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{overallProgress.completed}</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-slate-400" />
            <span className="text-xs text-slate-400">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-slate-400">{overallProgress.notDone}</div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      {recentActivity.length > 0 && (
        <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  {activity.status === 'completed' ? (
                    <Check size={18} className="text-green-400" />
                  ) : (
                    <X size={18} className="text-red-400" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{activity.type}</p>
                    <p className="text-xs text-slate-400">{convertHRPercentageToBPM(activity.detail, maxHeartRate)}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Week {activity.week}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
