import React from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateOverallProgress, calculateWeekProgress, getScheduleForWeek } from '../utils/calculations';
import { convertHRPercentageToBPM } from '../utils/heartRate';

const ScheduleView = ({ 
  maxWeeks, 
  runningData, 
  cyclingData, 
  weightData, 
  yogaData,
  getOrCreateYogaEntry,
  workoutDays, 
  activeLevel, 
  updateWorkoutStatus,
  isCollapsed,
  toggleCollapsed,
  getWorkoutIdentifier,
  effectiveWeek,
  todayWeekday,
  startDate,
  maxHeartRate
}) => {
  const overallProgress = calculateOverallProgress(runningData, cyclingData, weightData, yogaData);
  
  // Check if program has started (start date is today or in the past)
  const programHasStarted = startDate ? new Date() >= new Date(startDate) : false;

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <div className="bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Overall Progress</h2>
            <p className="text-sm text-slate-400">
              Week {overallProgress.currentWeek} of {maxWeeks} - {overallProgress.completionRate}% Complete
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{overallProgress.completed}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{overallProgress.skipped}</div>
              <div className="text-xs text-slate-400">Skipped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-400">{overallProgress.notDone}</div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
          </div>
        </div>
      </div>
      
      {[...Array(maxWeeks)].map((_, weekIndex) => {
        const week = weekIndex + 1;
        const schedule = getScheduleForWeek(week, runningData, cyclingData, weightData, workoutDays, activeLevel, yogaData, getOrCreateYogaEntry);
        const weekProgress = calculateWeekProgress(week, runningData, cyclingData, weightData, yogaData);
        
        return (
          <div key={week} className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Week {week}</h2>
                <div className="text-sm text-slate-400">
                  {weekProgress.completionRate}% Complete ({weekProgress.completed}/{weekProgress.total})
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-slate-700">
              {Object.entries(schedule).map(([day, activities]) => {
                // Check if this is today's day in the current week
                const isToday = programHasStarted && week === effectiveWeek && day === todayWeekday;
                
                return (
                <div 
                  key={day} 
                  className={`p-4 ${isToday ? 'bg-orange-900/20 border-2 border-orange-500 rounded-lg' : ''}`}
                >
                  <h3 className="font-bold text-white mb-3 text-center flex items-center justify-center gap-2">
                    {day}
                    {isToday && (
                      <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {activities.length > 0 ? (
                      activities.map((activity, idx) => {
                        const getStatusColors = () => {
                          if (activity.status === 'completed') {
                            return 'bg-green-600 border-green-500 text-white';
                          } else if (activity.status === 'skipped') {
                            return 'bg-red-600 border-red-500 text-white';
                          } else {
                            // Default colors based on activity type
                            if (activity.type === 'Running' && activity.isInterval) {
                              return 'bg-orange-900 border-orange-700 text-orange-200';
                            } else if (activity.type === 'Running') {
                              return 'bg-blue-900 border-blue-700 text-blue-200';
                            } else if (activity.type === 'Weights') {
                              return 'bg-purple-900 border-purple-700 text-purple-200';
                            } else if (activity.type === 'Yoga') {
                              return 'bg-indigo-900 border-indigo-700 text-indigo-200';
                            } else {
                              return 'bg-green-900 border-green-700 text-green-200';
                            }
                          }
                        };
                        
                        const getActivityType = () => {
                          if (activity.type === 'Running') return 'running';
                          if (activity.type === 'Cycling') return 'cycling';
                          if (activity.type === 'Weights') return 'weights';
                          if (activity.type === 'Yoga') return 'yoga';
                          return 'running';
                        };
                        
                        const workoutId = getWorkoutIdentifier(getActivityType(), activity.identifier);
                        const collapsed = isCollapsed(workoutId);
                        const shouldShowCollapsed = (activity.status === 'completed' || activity.status === 'skipped') && collapsed;
                        
                        return (
                          <div
                            key={idx}
                            className={`rounded text-xs border-2 transition-all ${getStatusColors()} ${
                              shouldShowCollapsed ? 'p-2' : 'p-2 cursor-pointer hover:opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold">{activity.type}</div>
                              <div className="flex items-center gap-1">
                                {(activity.status === 'completed' || activity.status === 'skipped') && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCollapsed(workoutId);
                                      }}
                                      className="p-0.5 hover:opacity-70 transition-opacity"
                                      title={collapsed ? 'Expand' : 'Collapse'}
                                    >
                                      {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                                    </button>
                                    {activity.status === 'completed' ? (
                                      <Check size={14} className="flex-shrink-0" />
                                    ) : (
                                      <X size={14} className="flex-shrink-0" />
                                    )}
                                  </>
                                )}
                                {activity.status === 'not_done' && (
                                  <button
                                    onClick={() => updateWorkoutStatus(getActivityType(), activity.identifier, activity.status)}
                                    className="opacity-50 hover:opacity-100"
                                  >
                                    ○
                                  </button>
                                )}
                              </div>
                            </div>
                            {shouldShowCollapsed ? (
                              <div className="text-xs opacity-90 italic">Click to expand</div>
                            ) : (
                              <>
                                <div className="text-xs opacity-90">{convertHRPercentageToBPM(activity.detail, maxHeartRate)}</div>
                                {(activity.status === 'completed' || activity.status === 'skipped') && (
                                  <button
                                    onClick={() => updateWorkoutStatus(getActivityType(), activity.identifier, activity.status)}
                                    className="mt-1 text-xs opacity-75 hover:opacity-100"
                                  >
                                    Change Status
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-500 text-xs text-center italic">Rest Day</div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleView;

